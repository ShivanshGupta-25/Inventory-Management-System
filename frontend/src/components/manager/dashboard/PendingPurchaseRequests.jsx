
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getManagerPurchaseRequests } from "../../../services/managerPurchaseRequestApi";

const priorityStyles = {
  Low: "text-slate-600 bg-slate-100",
  Medium: "text-blue-600 bg-blue-50",
  High: "text-orange-600 bg-orange-50",
  Urgent: "text-red-600 bg-red-50",
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PendingPurchaseRequests = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);

      const response = await getManagerPurchaseRequests({
        status: "Pending",
      });

      setRequests((response.data || []).slice(0, 5));
    } catch (error) {
      console.error(
        "Failed to load pending purchase requests:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingRequests();
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
            <ClipboardList size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Pending Purchase Requests
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Requests waiting for your review
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            navigate("/manager/purchase-requests")
          }
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          View All
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <RefreshCw
              size={22}
              className="animate-spin text-slate-400"
            />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-10 text-center">
            <ClipboardList
              size={32}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-600">
              No pending requests
            </p>

            <p className="mt-1 text-xs text-slate-400">
              All purchase requests have been reviewed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request._id}
                className="rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {request.orderNumber}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {request.createdBy?.name || "Unknown staff"}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <Clock3 size={13} />
                      {formatDate(request.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        priorityStyles[request.priority] ||
                        priorityStyles.Medium
                      }`}
                    >
                      {request.priority || "Medium"}
                    </span>

                    <button
                      onClick={() =>
                        navigate(
                          "/manager/purchase-requests"
                        )
                      }
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Review
                    </button>
                  </div>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  {request.items?.length || 0} product(s) requested
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PendingPurchaseRequests;