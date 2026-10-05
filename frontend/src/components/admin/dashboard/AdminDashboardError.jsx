import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const AdminDashboardError = ({
  error,
  onRetry,
}) => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle size={23} />
        </div>

        <h2 className="mt-4 text-base font-bold text-slate-900">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {error}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardError;