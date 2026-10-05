import {
  ArrowRight,
  FileClock,
  ShieldCheck,
} from "lucide-react";

import {
  useState,
} from "react";

import AdminAuditLogModal from "./AdminAuditLogModal";

const AdminSecurityActivity = () => {
  const [
    auditLogsOpen,
    setAuditLogsOpen,
  ] = useState(false);

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* HEADER */}

        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Security Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Administrative security events are recorded
              in the audit system.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setAuditLogsOpen(true)
            }
            className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-slate-700 transition hover:text-slate-950 sm:self-auto"
          >
            View Audit Logs

            <ArrowRight size={15} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="p-6">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
              <FileClock size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                Security events are audited
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Password changes and administrative
                account changes are recorded for
                accountability.
              </p>
            </div>

            <ShieldCheck
              size={18}
              className="ml-auto shrink-0 text-emerald-500"
            />
          </div>
        </div>
      </section>

      {/* AUDIT LOG MODAL */}

      {auditLogsOpen && (
        <AdminAuditLogModal
          onClose={() =>
            setAuditLogsOpen(false)
          }
        />
      )}
    </>
  );
};

export default AdminSecurityActivity;