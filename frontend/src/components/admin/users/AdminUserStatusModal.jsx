import {
  AlertTriangle,
  CheckCircle2,
  UserX,
  X,
} from "lucide-react";

const AdminUserStatusModal = ({
  user,
  loading = false,
  onClose,
  onSubmit,
}) => {
  if (!user) return null;

  const disabling =
    user.status !== "disabled";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between px-5 pt-5">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              disabling
                ? "bg-amber-50 text-amber-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {disabling ? (
              <UserX size={20} />
            ) : (
              <CheckCircle2 size={20} />
            )}
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
            {disabling
              ? "Disable Account?"
              : "Enable Account?"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {disabling
              ? `Disabling ${user.name}'s account will prevent the user from accessing InventoryFlow.`
              : `Enabling ${user.name}'s account will restore access to InventoryFlow.`}
          </p>

          {disabling && (
            <div className="mt-4 flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
              <AlertTriangle
                size={17}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <p className="text-xs leading-5 text-amber-700">
                Make sure the account should no longer
                have access before continuing.
              </p>
            </div>
          )}
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
            onClick={() =>
              onSubmit(
                disabling
                  ? "disabled"
                  : "active"
              )
            }
            disabled={loading}
            className={`h-10 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-50 ${
              disabling
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading
              ? "Updating..."
              : disabling
              ? "Disable Account"
              : "Enable Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserStatusModal;