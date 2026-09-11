import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  RefreshCw,
} from "lucide-react";

import StaffSidebar from "../StaffSidebar";
import StaffHeader from "../StaffHeader";

import {
  getStockHistory,
} from "../../../services/staffActivityApi";

const StaffStockHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getStockHistory({
          type,
        });

      setHistory(data || []);
    } catch (err) {
      console.error(
        "Failed to load stock history:",
        err
      );

      setError(
        err.message ||
          "Unable to load stock history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [type]);

  return (
    <div className="min-h-screen bg-slate-50">
      <StaffSidebar />

      <div className="lg:pl-64">
        <StaffHeader />

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-[1400px]">

            <div className="mb-6">
              <p className="text-xs font-medium text-slate-400">
                Workspace
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Stock History
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Review inventory stock movements.
              </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {[
                ["", "All"],
                ["IN", "Stock In"],
                ["OUT", "Stock Out"],
                ["ADJUSTMENT", "Adjustments"],
              ].map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setType(value)
                    }
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                      type === value
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            {loading && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <RefreshCw
                  size={22}
                  className="mx-auto animate-spin text-slate-400"
                />

                <p className="mt-3 text-sm text-slate-500">
                  Loading stock history...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            {!loading &&
              !error &&
              history.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                  <History
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No stock movements found
                  </p>
                </div>
              )}

            {!loading &&
              !error &&
              history.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                            Product
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                            Action
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                            Quantity
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                            Stock
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                            Reason
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                            Date
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {history.map(
                          (movement) => {
                            const isIn =
                              movement.type ===
                              "IN";

                            return (
                              <tr
                                key={
                                  movement._id
                                }
                                className="hover:bg-slate-50"
                              >
                                <td className="px-5 py-4">
                                  <p className="text-xs font-semibold text-slate-700">
                                    {movement
                                      .product
                                      ?.productName ||
                                      "Unknown Product"}
                                  </p>

                                  <p className="mt-1 text-[11px] text-slate-400">
                                    {movement
                                      .product
                                      ?.sku ||
                                      "—"}
                                  </p>
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    {isIn ? (
                                      <ArrowDownToLine
                                        size={15}
                                        className="text-emerald-600"
                                      />
                                    ) : (
                                      <ArrowUpFromLine
                                        size={15}
                                        className="text-slate-500"
                                      />
                                    )}

                                    <span className="text-xs font-semibold text-slate-600">
                                      {
                                        movement.type
                                      }
                                    </span>
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <span
                                    className={`text-xs font-semibold ${
                                      isIn
                                        ? "text-emerald-600"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {isIn
                                      ? "+"
                                      : "-"}
                                    {
                                      movement.quantity
                                    }
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <span className="text-xs text-slate-600">
                                    {
                                      movement.previousStock
                                    }
                                    {" → "}
                                    {
                                      movement.newStock
                                    }
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <span className="text-xs text-slate-500">
                                    {
                                      movement.reason
                                    }
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <span className="text-xs text-slate-500">
                                    {new Date(
                                      movement.createdAt
                                    ).toLocaleString(
                                      "en-IN",
                                      {
                                        dateStyle:
                                          "medium",
                                        timeStyle:
                                          "short",
                                      }
                                    )}
                                  </span>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffStockHistoryPage;