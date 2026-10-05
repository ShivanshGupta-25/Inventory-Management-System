import {
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react";

const AdminDeleteUserModal = ({
  user,
  loading = false,
  onClose,
  onSubmit,
}) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-red-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between px-5 pt-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Trash2 size={20} />
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

        <div className="px-5 pb-5 pt-4">
          <h2 className="text-lg font-bold text-slate-900">
            Delete User?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You are about to permanently delete this
            account.
          </p>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              {user.name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {user.email}
            </p>
          </div>

          <div className="mt-4 flex gap-3 rounded-xl border border-red-100 bg-red-50 p-3">
            <AlertTriangle
              size={17}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <p className="text-xs leading-5 text-red-700">
              This action cannot be undone. The account
              and its user record will be permanently
              removed.
            </p>
          </div>
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
            onClick={onSubmit}
            disabled={loading}
            className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading
              ? "Deleting..."
              : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDeleteUserModal;