import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const AdminReportsError = ({
  message = "Unable to load reports.",
  onRetry,
}) => {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertCircle size={18} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-red-900">
              Unable to load reports
            </h2>

            <p className="mt-1 text-xs text-red-700">
              {message}
            </p>
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminReportsError;