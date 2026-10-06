const fs = require("fs/promises");
const mongoose = require("mongoose");
const os = require("os");
const { performance } = require("perf_hooks");

const { getSecurityHealth } = require("./securityEventService");

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const CONFIG = {
  // Admins polling from several tabs share one result for this long.
  cacheTtlMs: 3000,

  dbPingTimeoutMs: 3000,
  dbStatsTimeoutMs: 5000,
  securityTimeoutMs: 3000,

  dbLatencyWarningMs: 500,
  dbLatencyCriticalMs: 1500,

  // Kept in line with the dashboard, which flags memory from 75%.
  memoryWarningPercent: 75,
  memoryCriticalPercent: 90,

  // 5-minute load average divided by cores.
  loadPerCoreWarning: 1,
  loadPerCoreCritical: 1.5,
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const STATUS_RANK = { healthy: 0, warning: 1, critical: 2 };

// Worst status wins. Anything unrecognised is ignored.
const worstStatus = (statuses) =>
  statuses.reduce(
    (worst, status) =>
      (STATUS_RANK[status] ?? -1) > STATUS_RANK[worst] ? status : worst,
    "healthy"
  );

const round2 = (value) => Number(value.toFixed(2));

// A slow dependency must not hang the whole health endpoint.
const withTimeout = (promise, ms, label) => {
  let timer;

  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    );
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const readText = async (path) => {
  try {
    return (await fs.readFile(path, "utf8")).trim();
  } catch {
    return null;
  }
};

// "max", empty and unparsable values all mean "no limit / unknown".
const toNumber = (text) => {
  if (text === null || text === undefined || text === "max") return null;

  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};

const getStatValue = (text, key) => {
  if (!text) return null;

  const match = text.match(new RegExp(`^${key}\\s+(\\d+)`, "m"));
  return match ? Number(match[1]) : null;
};

/*
|--------------------------------------------------------------------------
| MEMORY
|--------------------------------------------------------------------------
|
| os.freemem() ignores reclaimable cache on Linux, which makes a healthy
| server look nearly full. This reads "available" memory instead, and respects
| container (cgroup) limits so Docker/Kubernetes report their own ceiling
| rather than the host's.
|
*/

const buildMemory = (total, free, scope) => {
  const used = Math.max(0, total - free);

  return {
    total,
    free,
    used,
    percentage: total > 0 ? round2((used / total) * 100) : 0,
    scope,
  };
};

const getMemoryInfo = async () => {
  const hostTotal = os.totalmem();

  // cgroup v2, then v1
  const limit =
    toNumber(await readText("/sys/fs/cgroup/memory.max")) ??
    toNumber(await readText("/sys/fs/cgroup/memory/memory.limit_in_bytes"));

  if (limit && limit < hostTotal) {
    const current =
      toNumber(await readText("/sys/fs/cgroup/memory.current")) ??
      toNumber(await readText("/sys/fs/cgroup/memory/memory.usage_in_bytes"));

    if (current !== null) {
      const stat =
        (await readText("/sys/fs/cgroup/memory.stat")) ??
        (await readText("/sys/fs/cgroup/memory/memory.stat"));

      // Inactive file cache is reclaimable, so it isn't real pressure.
      const reclaimable =
        getStatValue(stat, "inactive_file") ??
        getStatValue(stat, "total_inactive_file") ??
        0;

      const used = Math.min(limit, Math.max(0, current - reclaimable));
      return buildMemory(limit, limit - used, "container");
    }
  }

  if (process.platform === "linux") {
    const meminfo = await readText("/proc/meminfo");
    const match = meminfo?.match(/^MemAvailable:\s+(\d+)\s+kB/m);

    if (match) {
      return buildMemory(hostTotal, Number(match[1]) * 1024, "host");
    }
  }

  return buildMemory(hostTotal, os.freemem(), "host");
};

/*
|--------------------------------------------------------------------------
| CPU
|--------------------------------------------------------------------------
|
| Inside a CPU-limited container, os.loadavg() still reports the whole host,
| so dividing it by the container's core quota would be meaningless. In that
| case the load average is left empty rather than reporting a misleading one.
|
*/

const getCpuInfo = async () => {
  const hostCores =
    typeof os.availableParallelism === "function"
      ? os.availableParallelism()
      : os.cpus().length;

  let quotaCores = null;

  const cpuMax = await readText("/sys/fs/cgroup/cpu.max"); // cgroup v2

  if (cpuMax) {
    const [quota, period] = cpuMax.split(/\s+/);

    if (quota !== "max" && Number(period) > 0) {
      quotaCores = Number(quota) / Number(period);
    }
  } else {
    // cgroup v1
    const quota = toNumber(await readText("/sys/fs/cgroup/cpu/cpu.cfs_quota_us"));
    const period = toNumber(await readText("/sys/fs/cgroup/cpu/cpu.cfs_period_us"));

    if (quota && quota > 0 && period && period > 0) {
      quotaCores = quota / period;
    }
  }

  const limited = quotaCores !== null && quotaCores > 0 && quotaCores < hostCores;
  const cores = limited ? round2(quotaCores) : hostCores;

  const loadAverage = limited ? [] : os.loadavg().map(round2);

  // Load per core is only meaningful on Linux/macOS with no CPU limit.
  const loadPerCore =
    !limited && process.platform !== "win32" && cores > 0
      ? round2(loadAverage[1] / cores)
      : null;

  return { cores, limited, loadAverage, loadPerCore };
};

/*
|--------------------------------------------------------------------------
| DATABASE HEALTH
|--------------------------------------------------------------------------
*/

const getDatabaseHealth = async () => {
  const database = {
    status: "critical",
    latency: null,
    state: mongoose.connection.readyState ?? 0,
    databaseName: mongoose.connection.name || null,
    collections: null,
    dataSize: null,
    storageSize: null,
    indexSize: null,
    documents: null,
    connections: null,
  };

  const db = mongoose.connection.db;

  if (mongoose.connection.readyState !== 1 || !db) {
    return database;
  }

  try {
    const start = performance.now();

    await withTimeout(db.admin().ping(), CONFIG.dbPingTimeoutMs, "MongoDB ping");

    const latency = Math.round(performance.now() - start);

    let status = "healthy";

    if (latency > CONFIG.dbLatencyCriticalMs) {
      status = "critical";
    } else if (latency > CONFIG.dbLatencyWarningMs) {
      status = "warning";
    }

    // Stats are nice to have. If they fail, the ping already proved the
    // database is reachable, so don't mark it down.
    const [statsResult, serverResult] = await Promise.allSettled([
      withTimeout(
        db.command({ dbStats: 1 }),
        CONFIG.dbStatsTimeoutMs,
        "MongoDB dbStats"
      ),
      // Needs extra privileges on some hosted plans. Optional.
      withTimeout(
        db.admin().serverStatus(),
        CONFIG.dbStatsTimeoutMs,
        "MongoDB serverStatus"
      ),
    ]);

    const stats = statsResult.status === "fulfilled" ? statsResult.value : null;

    const connections =
      serverResult.status === "fulfilled"
        ? serverResult.value?.connections
        : null;

    return {
      ...database,
      status,
      latency,
      collections: stats?.collections ?? null,
      dataSize: stats?.dataSize ?? null,
      storageSize: stats?.storageSize ?? null,
      indexSize: stats?.indexSize ?? null,
      documents: stats?.objects ?? null,
      connections:
        connections &&
        Number.isFinite(connections.current) &&
        Number.isFinite(connections.available)
          ? {
              current: connections.current,
              available: connections.available,
            }
          : null,
    };
  } catch (error) {
    console.error("System health database check failed:", error);
    return database;
  }
};

/*
|--------------------------------------------------------------------------
| SERVER / INFRASTRUCTURE HEALTH
|--------------------------------------------------------------------------
*/

const getServerHealth = async () => {
  const processMemory = process.memoryUsage();

  const [memory, cpu] = await Promise.all([getMemoryInfo(), getCpuInfo()]);

  let memoryStatus = "healthy";

  if (memory.percentage >= CONFIG.memoryCriticalPercent) {
    memoryStatus = "critical";
  } else if (memory.percentage >= CONFIG.memoryWarningPercent) {
    memoryStatus = "warning";
  }

  let cpuStatus = "healthy";

  if (cpu.loadPerCore !== null) {
    if (cpu.loadPerCore >= CONFIG.loadPerCoreCritical) {
      cpuStatus = "critical";
    } else if (cpu.loadPerCore >= CONFIG.loadPerCoreWarning) {
      cpuStatus = "warning";
    }
  }

  return {
    /*
     * API/process availability. This code is running, so the process is up.
     */
    status: "healthy",

    /*
     * Infrastructure/resource condition (memory and CPU pressure).
     */
    resources: {
      status: worstStatus([memoryStatus, cpuStatus]),
      memory,
      cpu: {
        cores: cpu.cores,
        loadAverage: cpu.loadAverage,
        loadPerCore: cpu.loadPerCore,
        limited: cpu.limited,
      },
    },

    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || "development",
    platform: process.platform,
    architecture: process.arch,

    /*
     * Node.js process memory
     */
    memory: {
      rss: processMemory.rss,
      heapTotal: processMemory.heapTotal,
      heapUsed: processMemory.heapUsed,
      external: processMemory.external,
    },
  };
};

/*
|--------------------------------------------------------------------------
| SECURITY HEALTH
|--------------------------------------------------------------------------
|
| A failure here must not take the whole health page down.
|
*/

const getSecuritySafe = async () => {
  try {
    return await withTimeout(
      getSecurityHealth(),
      CONFIG.securityTimeoutMs,
      "Security health"
    );
  } catch (error) {
    console.error("System health security check failed:", error);

    return {
      status: "unknown",
      failedLogins: null,
      suspiciousEvents: null,
      recentEvents: [],
    };
  }
};

/*
|--------------------------------------------------------------------------
| SYSTEM HEALTH
|--------------------------------------------------------------------------
*/

const buildSystemHealth = async () => {
  const startedAt = performance.now();
  const checkedAt = new Date();

  // Independent checks run side by side instead of one after another.
  const [database, server, security] = await Promise.all([
    getDatabaseHealth(),
    getServerHealth(),
    getSecuritySafe(),
  ]);

  const authentication = {
    status: process.env.JWT_SECRET ? "healthy" : "critical",
    provider: "JWT",
    secretConfigured: Boolean(process.env.JWT_SECRET),
  };

  const rateLimiting = {
    status: "configured",
  };

  /*
   * Overall status is the worst of the core services and resource pressure.
   * Security findings (such as a burst of failed logins) can degrade the
   * system to "warning" but never mark it "critical" on their own.
   */
  let overallStatus = worstStatus([
    database.status,
    server.status,
    authentication.status,
    server.resources.status,
  ]);

  if (
    overallStatus === "healthy" &&
    (security.status === "warning" || security.status === "critical")
  ) {
    overallStatus = "warning";
  }

  return {
    status: overallStatus,
    checkedAt,
    durationMs: Math.round(performance.now() - startedAt),
    server,
    database,
    authentication,
    rateLimiting,
    security,
  };
};

/*
|--------------------------------------------------------------------------
| CACHE
|--------------------------------------------------------------------------
|
| Several admins (or tabs) polling at once share one computation, and
| concurrent requests wait on the same in-flight check.
|
*/

let cached = { value: null, expiresAt: 0 };
let inFlight = null;

const getSystemHealth = async (options = {}) => {
  const force = options?.force === true;

  if (!force && cached.value && Date.now() < cached.expiresAt) {
    return cached.value;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = buildSystemHealth()
    .then((value) => {
      cached = { value, expiresAt: Date.now() + CONFIG.cacheTtlMs };
      return value;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

module.exports = {
  getSystemHealth,
};