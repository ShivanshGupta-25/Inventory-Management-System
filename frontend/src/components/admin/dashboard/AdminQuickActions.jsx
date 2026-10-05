import {
  Activity,
  CheckCircle2,
  ChevronRight,
  UserPlus,
  Users,
} from "lucide-react";

import AdminSectionHeader from "./AdminSectionHeader";

const AdminQuickActions = ({
  onNavigate,
}) => {
  return (
    <section>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <AdminSectionHeader
          title="Quick Actions"
          description="Common administrative tasks"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/* Manage Users */}

          <button
            type="button"
            onClick={() =>
              onNavigate("/admin/users")
            }
            className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800">
                Manage Users
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Search and manage accounts
              </p>
            </div>

            <ChevronRight
              size={15}
              className="text-slate-300 transition-colors group-hover:text-blue-600"
            />
          </button>

          {/* Add User */}

          <button
            type="button"
            onClick={() =>
              onNavigate("/admin/users/create")
            }
            className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserPlus size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800">
                Add User
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Create a manager or staff account
              </p>
            </div>

            <ChevronRight
              size={15}
              className="text-slate-300 transition-colors group-hover:text-emerald-600"
            />
          </button>

          {/* Audit Logs */}

          <button
            type="button"
            onClick={() =>
              onNavigate("/admin/audit-logs")
            }
            className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Activity size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800">
                Audit Logs
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Review administrative actions
              </p>
            </div>

            <ChevronRight
              size={15}
              className="text-slate-300 transition-colors group-hover:text-violet-600"
            />
          </button>

          {/* System Health */}

          <button
            type="button"
            onClick={() =>
              onNavigate("/admin/system-health")
            }
            className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-amber-200 hover:bg-amber-50/40 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CheckCircle2 size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800">
                System Health
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Check system services
              </p>
            </div>

            <ChevronRight
              size={15}
              className="text-slate-300 transition-colors group-hover:text-amber-600"
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdminQuickActions;