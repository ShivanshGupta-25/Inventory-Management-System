import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const ROLE_COLORS = {
  admin: "#7c3aed",
  manager: "#0ea5e9",
  staff: "#10b981",
};

const AdminRoleDistribution = ({ data = [] }) => {
  const total = data.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-bold text-slate-900">
          Role Distribution
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Current distribution of platform roles.
        </p>
      </div>

      <div className="grid min-h-[320px] grid-cols-1 gap-4 p-5 sm:grid-cols-[1fr_150px] sm:p-6">
        <div className="min-h-[220px]">
          {data.length === 0 ? (
            <div className="flex h-full min-h-[220px] items-center justify-center">
              <p className="text-xs text-slate-400">
                No role data available.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        ROLE_COLORS[
                          String(entry.name).toLowerCase()
                        ] || "#94a3b8"
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex flex-col justify-center gap-3">
          {data.map((item) => {
            const percentage =
              total > 0
                ? ((Number(item.value || 0) / total) * 100).toFixed(1)
                : "0.0";

            return (
              <div key={item.name}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          ROLE_COLORS[
                            String(item.name).toLowerCase()
                          ] || "#94a3b8",
                      }}
                    />

                    <span className="text-[11px] font-semibold capitalize text-slate-700">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400">
                    {percentage}%
                  </span>
                </div>

                <p className="mt-1 pl-4 text-xs font-bold text-slate-900">
                  {Number(item.value || 0).toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AdminRoleDistribution;