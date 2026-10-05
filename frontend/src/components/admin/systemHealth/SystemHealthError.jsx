import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const SystemHealthError = ({
  message,
  onRetry,
}) => {
  return (
    <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
      <div className="mx-auto max-w-md text-center">

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle size={22} />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Unable to load system health
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message ||
            "The system health information could not be retrieved."}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <RefreshCw size={15} />
          Try Again
        </button>

      </div>
    </div>
  );
};

export default SystemHealthError;