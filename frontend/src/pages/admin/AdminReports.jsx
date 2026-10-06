import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import AdminReportsHeader from "../../components/admin/reports/AdminReportsHeader";
import AdminReportFilters from "../../components/admin/reports/AdminReportFilters";
import AdminReportSummary from "../../components/admin/reports/AdminReportSummary";
import AdminUserGrowthChart from "../../components/admin/reports/AdminUserGrowthChart";
import AdminRoleDistribution from "../../components/admin/reports/AdminRoleDistribution";
import AdminAccountStatusChart from "../../components/admin/reports/AdminAccountStatusChart";
import AdminActivityChart from "../../components/admin/reports/AdminActivityChart";
import AdminSecurityChart from "../../components/admin/reports/AdminSecurityChart";
import AdminSystemHealthChart from "../../components/admin/reports/AdminSystemHealthChart";
import AdminReportsSkeleton from "../../components/admin/reports/AdminReportsSkeleton";
import AdminReportsError from "../../components/admin/reports/AdminReportsError";
import AdminSecurityEventsTable from "../../components/admin/reports/AdminSecurityEventsTable";

import { getAdminReports } from "../../services/adminService";

import {
  exportAdminReportCSV,
  printAdminReport,
} from "../../utils/adminReportExport";

const AdminReports = () => {
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [range, setRange] = useState("30d");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Used for visual PDF / print export.
  // It contains the rendered charts, summary cards,
  // activity tables, and security events.
  const reportContentRef = useRef(null);

  const securityEvents = report?.security?.events || [];

  const resolveDateRange = useCallback(() => {
    const today = new Date();

    const formatDate = (date) =>
      date.toISOString().split("T")[0];

    if (range === "custom") {
      return {
        from: fromDate || null,
        to: toDate || null,
      };
    }

    if (range === "1y") {
      return {
        from: `${today.getFullYear()}-01-01`,
        to: formatDate(today),
      };
    }

    const daysMap = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };

    const days = daysMap[range] || 30;

    const from = new Date(today);

    from.setDate(from.getDate() - (days - 1));

    return {
      from: formatDate(from),
      to: formatDate(today),
    };
  }, [range, fromDate, toDate]);

  const loadReports = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const { from, to } = resolveDateRange();

        const response = await getAdminReports({
          from,
          to,
        });

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load admin reports."
          );
        }

        setReport(
          response?.report ||
            response?.data ||
            null
        );
      } catch (err) {
        console.error(
          "Admin reports error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load admin reports."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [resolveDateRange]
  );

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const summary = report?.summary || {};

  const userGrowth =
    report?.users?.growth || [];

  const roleDistribution =
    report?.users?.roles || [];

  const accountStatus =
    report?.users?.status || [];

  const activity =
    report?.activity?.timeline || [];

  const security =
    report?.security?.loginTrend || [];

  const systemHealth =
    report?.system?.healthTrend || [];

  const handleRangeChange = (value) => {
    setRange(value);

    if (value !== "custom") {
      setFromDate("");
      setToDate("");
    }
  };

  const handleExportCSV = () => {
    try {
      if (!report) {
        throw new Error(
          "No report data available to export."
        );
      }

      exportAdminReportCSV(report);
    } catch (err) {
      console.error(
        "CSV export error:",
        err
      );

      setError(
        err?.message ||
          "Unable to export CSV."
      );
    }
  };

  const handleExportPDF = () => {
    try {
      if (!report) {
        throw new Error(
          "No report data available to export."
        );
      }

      if (!reportContentRef.current) {
        throw new Error(
          "Report content is not ready for export."
        );
      }

      printAdminReport(
        reportContentRef.current,
        report
      );
    } catch (err) {
      console.error(
        "PDF export error:",
        err
      );

      setError(
        err?.message ||
          "Unable to export the report."
      );
    }
  };

  if (loading) {
    return <AdminReportsSkeleton />;
  }

  if (error && !report) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AdminReportsError
            message={error}
            onRetry={() => loadReports()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            PAGE HEADER
            ===================================================== */}
        <AdminReportsHeader
          onRefresh={() =>
            loadReports({
              silent: true,
            })
          }
          refreshing={refreshing}
          onExportCSV={handleExportCSV}
          onPrintPDF={handleExportPDF}
        />

        {/* =====================================================
            EXPORTABLE REPORT CONTENT

            Everything inside this ref is cloned by
            printAdminReport(), including rendered Recharts SVGs.
            ===================================================== */}
        <div
          ref={reportContentRef}
          className="space-y-6"
        >

          {/* ===================================================
              REPORT FILTERS
              Hidden during print / PDF export
              =================================================== */}
          <div className="report-no-print">
            <AdminReportFilters
              range={range}
              onRangeChange={handleRangeChange}
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
            />
          </div>

          {/* ===================================================
              CUSTOM RANGE STATUS
              Hidden during print / PDF export
              =================================================== */}
          {range === "custom" &&
            fromDate &&
            toDate && (
              <div className="report-no-print flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50 px-4 py-3">
                <p className="text-xs font-medium text-violet-700">
                  Showing report data from{" "}
                  <span className="font-bold">
                    {fromDate}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold">
                    {toDate}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() => loadReports()}
                  className="text-[10px] font-bold uppercase tracking-wider text-violet-700 transition-colors hover:text-violet-900"
                >
                  Apply
                </button>
              </div>
            )}

          {/* ===================================================
              SUMMARY
              =================================================== */}
          <AdminReportSummary
            summary={summary}
          />

          {/* ===================================================
              USER ANALYTICS
              =================================================== */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AdminUserGrowthChart
              data={userGrowth}
            />

            <AdminRoleDistribution
              data={roleDistribution}
            />
          </div>

          {/* ===================================================
              SECURITY EVENTS
              =================================================== */}
          <AdminSecurityEventsTable
            events={securityEvents}
          />

          {/* ===================================================
              ACCOUNT + ACTIVITY ANALYTICS
              =================================================== */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AdminAccountStatusChart
              data={accountStatus}
            />

            <AdminActivityChart
              data={activity}
            />
          </div>

          {/* ===================================================
              SECURITY TREND
              =================================================== */}
          <AdminSecurityChart
            data={security}
          />

          {/* ===================================================
              SYSTEM HEALTH TREND
              =================================================== */}
          <AdminSystemHealthChart
            data={systemHealth}
          />

          {/* ===================================================
              NON-BLOCKING ERROR
              Hidden during print / PDF export
              =================================================== */}
          {error && (
            <div className="report-no-print rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;