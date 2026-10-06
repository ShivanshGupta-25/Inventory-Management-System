import {
  BarChart3,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  RefreshCw,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

const AdminReportsHeader = ({
  onRefresh,
  refreshing = false,
  onExportCSV,
  onPrintPDF,
}) => {
  const [exportOpen, setExportOpen] =
    useState(false);

  const exportRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        exportRef.current &&
        !exportRef.current.contains(
          event.target
        )
      ) {
        setExportOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleCSV = () => {
    setExportOpen(false);
    onExportCSV?.();
  };

  const handlePDF = () => {
    setExportOpen(false);
    onPrintPDF?.();
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <BarChart3
              size={19}
              strokeWidth={2}
            />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Reports
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Platform-wide administrative and system analytics.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>

        <div
          ref={exportRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setExportOpen(
                (previous) => !previous
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Download size={14} />

            Export

            <ChevronDown
              size={13}
              className={
                exportOpen
                  ? "rotate-180 transition-transform"
                  : "transition-transform"
              }
            />
          </button>

          {exportOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              {/* <button
                type="button"
                onClick={handleCSV}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <FileSpreadsheet size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Export CSV
                  </p>

                  <p className="mt-0.5 text-[9px] text-slate-400">
                    Opens directly in Excel
                  </p>
                </div>
              </button> */}

              <button
                type="button"
                onClick={handlePDF}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <FileText size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Save as PDF
                  </p>

                  <p className="mt-0.5 text-[9px] text-slate-400">
                    Opens the print dialog
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handlePDF}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <Printer size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Print Report
                  </p>

                  <p className="mt-0.5 text-[9px] text-slate-400">
                    Print-friendly report
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsHeader;