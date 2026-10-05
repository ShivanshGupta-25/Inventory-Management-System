import { useState } from "react";
import {
  BriefcaseBusiness,
  ShieldCheck,
  UserCog,
  X,
} from "lucide-react";

const AdminChangeRoleModal = ({
  user,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const [role, setRole] = useState(
    user?.role === "manager"
      ? "manager"
      : "staff"
  );

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Change User Role
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Change the access level for {user.name}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <button
            type="button"
            onClick={() => setRole("manager")}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
              role === "manager"
                ? "border-blue-300 bg-blue-50"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <BriefcaseBusiness size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Manager
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Manage operational inventory workflows.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole("staff")}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
              role === "staff"
                ? "border-slate-300 bg-slate-100"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
              <UserCog size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Staff
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Access assigned staff operations.
              </p>
            </div>
          </button>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading || role === user.role}
            onClick={() => onSubmit(role)}
            className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Updating..."
              : "Change Role"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminChangeRoleModal;