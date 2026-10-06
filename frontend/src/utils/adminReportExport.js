// src/utils/adminReportExport.js
//
// CSV  -> Excel-friendly (UTF-8 BOM, numbers unquoted, formula-injection safe)
// PDF  -> a purpose-built HTML report (own SVG charts + tables) printed through
//         a hidden iframe. It no longer clones the live Recharts DOM, which is
//         what caused the broken / squashed / overflowing visuals.

const REPORT_TITLE = "InventoryFlow Admin Report";

/* ============================================================
   SHARED HELPERS
   ============================================================ */

const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

const formatShortDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const downloadBlob = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Pulls every section out of the report in one place (used by CSV + PDF). */
const normalizeReport = (report) => {
  const users = report?.users || {};
  return {
    summary: report?.summary || {},
    roles: users.roles || [],
    status: users.status || [],
    growth: users.growth || [],
    activity: report?.activity?.timeline || [],
    loginTrend: report?.security?.loginTrend || [],
    securityEvents: report?.security?.events || [],
    healthTrend: report?.system?.healthTrend || [],
  };
};

/* ============================================================
   CSV EXPORT
   ============================================================ */

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return "";

  // Numbers stay numbers so Excel can sum / chart them.
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  let str = String(value);

  // Prevent CSV/Excel formula injection from user-controlled text
  // (emails, user agents, descriptions...).
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Only quote when needed.
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
};

export const exportAdminReportCSV = (report) => {
  if (!report) throw new Error("No report data available.");

  const d = normalizeReport(report);
  const rows = [];

  const section = (title, headers, dataRows) => {
    rows.push([]);
    rows.push([title.toUpperCase()]);
    rows.push(headers);
    if (!dataRows.length) {
      rows.push(["No data available"]);
      return;
    }
    dataRows.forEach((r) => rows.push(r));
  };

  rows.push([REPORT_TITLE]);
  rows.push(["Generated At", formatDate(new Date())]);

  section("Report Summary", ["Metric", "Value"], [
    ["Total Users", toNumber(d.summary.totalUsers)],
    ["New Users", toNumber(d.summary.newUsers)],
    ["Active Users", toNumber(d.summary.activeUsers)],
    ["Disabled Users", toNumber(d.summary.disabledUsers)],
    ["Admin Actions", toNumber(d.summary.adminActions)],
    ["Security Events", toNumber(d.summary.securityEvents)],
  ]);

  section(
    "Role Distribution",
    ["Role", "Users"],
    d.roles.map((i) => [i?.name ?? "", toNumber(i?.value)])
  );

  section(
    "Account Status",
    ["Status", "Users"],
    d.status.map((i) => [i?.name ?? "", toNumber(i?.value)])
  );

  section(
    "User Growth",
    ["Date", "Total Users"],
    d.growth.map((i) => [i?.date ?? "", toNumber(i?.users)])
  );

  section(
    "Administrative Activity",
    ["Date", "Created", "Updated", "Status Changed", "Role Changed", "Deleted"],
    d.activity.map((i) => [
      i?.date ?? "",
      toNumber(i?.created),
      toNumber(i?.updated),
      toNumber(i?.statusChanged),
      toNumber(i?.roleChanged),
      toNumber(i?.deleted),
    ])
  );

  section(
    "Security Trend",
    ["Date", "Successful Logins", "Failed Logins", "Suspicious Events", "Rate Limit Triggered"],
    d.loginTrend.map((i) => [
      i?.date ?? "",
      toNumber(i?.successfulLogins),
      toNumber(i?.failedLogins),
      toNumber(i?.suspiciousEvents),
      toNumber(i?.rateLimitTriggered),
    ])
  );

  section(
    "Security Events",
    ["Event Type", "Severity", "Email", "IP Address", "Description", "User Agent", "Timestamp"],
    d.securityEvents.map((e) => [
      e?.type ?? "",
      e?.severity ?? "",
      e?.email ?? "",
      e?.ipAddress ?? "",
      e?.description ?? "",
      e?.userAgent ?? "",
      formatDate(e?.createdAt),
    ])
  );

  section(
    "System Health Trend",
    ["Date", "Status"],
    d.healthTrend.map((i) => [i?.date ?? "", i?.status ?? ""])
  );

  const csv = rows
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  // "\uFEFF" (BOM) makes Excel open the file as UTF-8 correctly.
  downloadBlob(
    "\uFEFF" + csv,
    `inventoryflow-admin-report-${timestamp}.csv`,
    "text/csv;charset=utf-8;"
  );
};

/* ============================================================
   SVG CHART BUILDERS (self-contained, no Recharts / Tailwind)
   ============================================================ */

const PALETTE = [
  "#4f46e5", // indigo
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#64748b", // slate
];

const EMPTY_STATE = `<div class="empty">No data available</div>`;

const niceMax = (max) => {
  if (max <= 0) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
};

const legendHtml = (items) =>
  `<div class="legend">${items
    .map(
      (i) =>
        `<span class="legend-item"><i style="background:${i.color}"></i>${escapeHtml(i.label)}</span>`
    )
    .join("")}</div>`;

/** Shared axes: grid lines, y labels, x labels. Returns svg markup + scale fns. */
const buildAxes = ({ labels, maxValue, width, height, pad }) => {
  const plotW = width - pad.l - pad.r;
  const plotH = height - pad.t - pad.b;
  const top = niceMax(maxValue);
  const ticks = 4;

  let svg = "";

  for (let i = 0; i <= ticks; i++) {
    const value = (top / ticks) * i;
    const y = pad.t + plotH - (plotH / ticks) * i;
    svg += `<line x1="${pad.l}" x2="${width - pad.r}" y1="${y}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>`;
    svg += `<text x="${pad.l - 8}" y="${y + 3}" text-anchor="end" font-size="10" fill="#64748b">${
      Number.isInteger(value) ? value : value.toFixed(1)
    }</text>`;
  }

  const maxLabels = 8;
  const every = Math.max(1, Math.ceil(labels.length / maxLabels));

  return {
    svg,
    plotW,
    plotH,
    top,
    xLabelsSvg: (xAt) =>
      labels
        .map((label, i) =>
          i % every === 0 || i === labels.length - 1
            ? `<text x="${xAt(i)}" y="${height - pad.b + 16}" text-anchor="middle" font-size="10" fill="#64748b">${escapeHtml(
                formatShortDate(label)
              )}</text>`
            : ""
        )
        .join(""),
    yAt: (v) => pad.t + plotH - (v / top) * plotH,
  };
};

const lineChart = ({ data, series, width = 640, height = 260 }) => {
  if (!data.length) return EMPTY_STATE;

  const pad = { l: 40, r: 16, t: 12, b: 28 };
  const labels = data.map((d) => d?.date ?? "");
  const maxValue = Math.max(
    0,
    ...data.flatMap((d) => series.map((s) => toNumber(d?.[s.key])))
  );

  const axes = buildAxes({ labels, maxValue, width, height, pad });
  const xAt = (i) =>
    data.length === 1
      ? pad.l + axes.plotW / 2
      : pad.l + (axes.plotW / (data.length - 1)) * i;

  let svg = axes.svg + axes.xLabelsSvg(xAt);

  series.forEach((s) => {
    const points = data.map((d, i) => `${xAt(i)},${axes.yAt(toNumber(d?.[s.key]))}`);
    svg += `<polyline points="${points.join(" ")}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    if (data.length <= 31) {
      data.forEach((d, i) => {
        svg += `<circle cx="${xAt(i)}" cy="${axes.yAt(toNumber(d?.[s.key]))}" r="2.5" fill="${s.color}"/>`;
      });
    }
  });

  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${svg}</svg>
    ${series.length > 1 ? legendHtml(series) : ""}`;
};

const stackedBarChart = ({ data, series, width = 640, height = 260 }) => {
  if (!data.length) return EMPTY_STATE;

  const pad = { l: 40, r: 16, t: 12, b: 28 };
  const labels = data.map((d) => d?.date ?? "");
  const totals = data.map((d) =>
    series.reduce((sum, s) => sum + toNumber(d?.[s.key]), 0)
  );

  const axes = buildAxes({ labels, maxValue: Math.max(0, ...totals), width, height, pad });
  const slot = axes.plotW / data.length;
  const barW = Math.min(36, slot * 0.65);
  const xAt = (i) => pad.l + slot * i + slot / 2;

  let svg = axes.svg + axes.xLabelsSvg(xAt);

  data.forEach((d, i) => {
    let acc = 0;
    series.forEach((s) => {
      const v = toNumber(d?.[s.key]);
      if (v <= 0) return;
      const yTop = axes.yAt(acc + v);
      const yBottom = axes.yAt(acc);
      svg += `<rect x="${xAt(i) - barW / 2}" y="${yTop}" width="${barW}" height="${Math.max(0, yBottom - yTop)}" fill="${s.color}" rx="1.5"/>`;
      acc += v;
    });
  });

  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${svg}</svg>
    ${legendHtml(series)}`;
};

const donutChart = ({ data }) => {
  const items = data
    .map((d, i) => ({
      label: d?.name ?? "",
      value: toNumber(d?.value),
      color: PALETTE[i % PALETTE.length],
    }))
    .filter((d) => d.value > 0);

  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total) return EMPTY_STATE;

  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;

  const segments = items
    .map((item) => {
      const len = (item.value / total) * c;
      const seg = `<circle cx="80" cy="80" r="${r}" fill="none" stroke="${item.color}" stroke-width="24"
        stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 80 80)"/>`;
      offset += len;
      return seg;
    })
    .join("");

  const rows = items
    .map(
      (i) => `<tr>
        <td><i class="dot" style="background:${i.color}"></i>${escapeHtml(i.label)}</td>
        <td class="num">${i.value}</td>
        <td class="num muted">${((i.value / total) * 100).toFixed(1)}%</td>
      </tr>`
    )
    .join("");

  return `
    <div class="donut">
      <svg viewBox="0 0 160 160" width="130" height="130" xmlns="http://www.w3.org/2000/svg">
        ${segments}
        <text x="80" y="78" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">${total}</text>
        <text x="80" y="95" text-anchor="middle" font-size="10" fill="#64748b">TOTAL</text>
      </svg>
      <table class="mini">${rows}</table>
    </div>`;
};

/* ============================================================
   HTML BUILDING BLOCKS
   ============================================================ */

const table = (headers, rows, { numericCols = [] } = {}) => {
  if (!rows.length) return EMPTY_STATE;
  return `
    <table class="data">
      <thead><tr>${headers
        .map((h, i) => `<th class="${numericCols.includes(i) ? "num" : ""}">${escapeHtml(h)}</th>`)
        .join("")}</tr></thead>
      <tbody>${rows
        .map(
          (r) =>
            `<tr>${r
              .map(
                (cell, i) =>
                  `<td class="${numericCols.includes(i) ? "num" : ""}">${cell}</td>`
              )
              .join("")}</tr>`
        )
        .join("")}</tbody>
    </table>`;
};

const card = (title, body, extraClass = "") => `
  <section class="card ${extraClass}">
    <h3>${escapeHtml(title)}</h3>
    ${body}
  </section>`;

const severityBadge = (severity) => {
  const s = String(severity || "").toLowerCase();
  const cls =
    s === "critical" || s === "high"
      ? "sev-high"
      : s === "medium" || s === "warning"
      ? "sev-med"
      : "sev-low";
  return `<span class="badge ${cls}">${escapeHtml(severity || "—")}</span>`;
};

const healthBadge = (status) => {
  const s = String(status || "").toLowerCase();
  const cls = /(down|critical|outage|error|fail)/.test(s)
    ? "sev-high"
    : /(degrad|warn|slow|partial)/.test(s)
    ? "sev-med"
    : "sev-ok";
  return `<span class="badge ${cls}">${escapeHtml(status || "—")}</span>`;
};

const buildReportHtml = (report) => {
  const d = normalizeReport(report);
  const s = d.summary;

  const kpis = [
    ["Total Users", s.totalUsers],
    ["New Users", s.newUsers],
    ["Active Users", s.activeUsers],
    ["Disabled Users", s.disabledUsers],
    ["Admin Actions", s.adminActions],
    ["Security Events", s.securityEvents],
  ]
    .map(
      ([label, value]) => `
      <div class="kpi">
        <div class="kpi-label">${escapeHtml(label)}</div>
        <div class="kpi-value">${toNumber(value).toLocaleString()}</div>
      </div>`
    )
    .join("");

  const growthChart = lineChart({
    data: d.growth,
    series: [{ key: "users", label: "Total Users", color: PALETTE[0] }],
  });

  const activityChart = stackedBarChart({
    data: d.activity,
    series: [
      { key: "created", label: "Created", color: "#10b981" },
      { key: "updated", label: "Updated", color: "#4f46e5" },
      { key: "statusChanged", label: "Status Changed", color: "#f59e0b" },
      { key: "roleChanged", label: "Role Changed", color: "#8b5cf6" },
      { key: "deleted", label: "Deleted", color: "#ef4444" },
    ],
  });

  const securityChart = lineChart({
    data: d.loginTrend,
    series: [
      { key: "successfulLogins", label: "Successful Logins", color: "#10b981" },
      { key: "failedLogins", label: "Failed Logins", color: "#ef4444" },
      { key: "suspiciousEvents", label: "Suspicious Events", color: "#f59e0b" },
      { key: "rateLimitTriggered", label: "Rate Limit Triggered", color: "#8b5cf6" },
    ],
  });

  const eventsTable = table(
    ["Timestamp", "Type", "Severity", "Email", "IP Address", "Description"],
    d.securityEvents.map((e) => [
      escapeHtml(formatDate(e?.createdAt)),
      escapeHtml(e?.type ?? ""),
      severityBadge(e?.severity),
      escapeHtml(e?.email ?? ""),
      escapeHtml(e?.ipAddress ?? ""),
      escapeHtml(e?.description ?? ""),
    ])
  );

  const healthTable = table(
    ["Date", "Status"],
    d.healthTrend.map((h) => [escapeHtml(formatShortDate(h?.date)), healthBadge(h?.status)])
  );

  return `
    <header class="header">
      <div>
        <h1>${escapeHtml(REPORT_TITLE)}</h1>
        <div class="meta">Generated: ${escapeHtml(formatDate(new Date()))}</div>
      </div>
    </header>

    <div class="kpis">${kpis}</div>

    <div class="grid-3">
      ${card("User Growth", growthChart, "span-2")}
      ${card("Role Distribution", donutChart({ data: d.roles }))}
    </div>

    <div class="grid-3">
      ${card("Administrative Activity", activityChart, "span-2")}
      ${card("Account Status", donutChart({ data: d.status }))}
    </div>

    <div class="grid-3">
      ${card("Login & Security Trend", securityChart, "span-2")}
      ${card("System Health", healthTable)}
    </div>

    <div class="page-break"></div>

    ${card("Security Events", eventsTable, "full")}
  `;
};

const PRINT_CSS = `
  @page { size: A4 landscape; margin: 12mm; }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #0f172a;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 12px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 12px;
    margin-bottom: 16px;
    border-bottom: 2px solid #4f46e5;
  }
  h1 { margin: 0; font-size: 22px; font-weight: 700; }
  .meta { margin-top: 4px; font-size: 11px; color: #64748b; }

  .kpis {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }
  .kpi {
    border: 1px solid #e2e8f0;
    border-left: 3px solid #4f46e5;
    border-radius: 8px;
    padding: 10px 12px;
    background: #f8fafc;
    break-inside: avoid;
  }
  .kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #64748b; }
  .kpi-value { margin-top: 4px; font-size: 20px; font-weight: 700; }

  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 12px;
  }
  .span-2 { grid-column: span 2; }
  .full { grid-column: 1 / -1; }

  .card {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 14px;
    background: #fff;
    min-width: 0;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .card h3 {
    margin: 0 0 10px;
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
  }
  .card.full { break-inside: auto; page-break-inside: auto; }

  svg { display: block; max-width: 100%; height: auto; }

  .legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 8px; font-size: 10px; color: #475569; }
  .legend-item { display: inline-flex; align-items: center; gap: 5px; }
  .legend-item i, .dot { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 6px; }

  .donut { display: flex; align-items: center; gap: 12px; }
  .donut svg { flex: 0 0 auto; }

  table { width: 100%; border-collapse: collapse; }
  table.mini td { padding: 3px 0; font-size: 11px; }
  table.data { font-size: 10px; table-layout: auto; }
  table.data th {
    text-align: left;
    padding: 6px 8px;
    background: #f1f5f9;
    color: #475569;
    font-weight: 600;
    border-bottom: 1px solid #cbd5e1;
  }
  table.data td {
    padding: 5px 8px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
    word-break: break-word;
  }
  thead { display: table-header-group; }
  tr { break-inside: avoid; page-break-inside: avoid; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .muted { color: #64748b; }

  .badge {
    display: inline-block;
    padding: 1px 7px;
    border-radius: 999px;
    font-size: 9px;
    font-weight: 600;
    text-transform: capitalize;
  }
  .sev-high { background: #fee2e2; color: #b91c1c; }
  .sev-med  { background: #fef3c7; color: #b45309; }
  .sev-low  { background: #e2e8f0; color: #475569; }
  .sev-ok   { background: #dcfce7; color: #15803d; }

  .empty {
    padding: 24px 0;
    text-align: center;
    color: #94a3b8;
    font-size: 11px;
  }

  .page-break { break-after: page; page-break-after: always; height: 0; }
`;

/* ============================================================
   PDF / PRINT EXPORT
   ============================================================ */

/**
 * Prints the report as a clean PDF (user picks "Save as PDF" in the dialog).
 *
 * `reportElement` is no longer needed (the report is rebuilt from data), but
 * the parameter is kept so existing calls `printAdminReport(ref.current, report)`
 * keep working.
 */
export const printAdminReport = (_reportElement, report) => {
  if (!report) throw new Error("No report data available.");

  const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(REPORT_TITLE)}</title>
        <style>${PRINT_CSS}</style>
      </head>
      <body>${buildReportHtml(report)}</body>
    </html>`;

  // Hidden iframe: no pop-up blocker issues, no style-loading race conditions.
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDoc = frameWindow.document;

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    iframe.remove();
  };

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  // Small delay so layout/fonts settle before the print dialog opens.
  setTimeout(() => {
    try {
      frameWindow.addEventListener("afterprint", cleanup);
      frameWindow.focus();
      frameWindow.print();
    } catch (error) {
      cleanup();
      throw error;
    }
    // Fallback in case "afterprint" never fires.
    setTimeout(cleanup, 60000);
  }, 400);
};