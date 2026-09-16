import {
  Eye,
  Pencil,
  Send,
  XCircle,
  Package,
  Loader2,
} from "lucide-react";

import PurchaseRequestStatus from "./PurchaseRequestStatus";

const PurchaseRequestTable = ({
  requests = [],
  onView,
  onEdit,
  onSubmit,
  onCancel,
  actionLoading = false,
}) => {
  /* =====================================================
     EMPTY STATE
  ===================================================== */

  if (!requests.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Package
            size={22}
            className="text-slate-400"
          />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          No purchase requests found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Create a purchase request to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">

          {/* =================================================
              HEADER
          ================================================= */}

          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Request
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Supplier
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Items
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Amount
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Expected
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          {/* =================================================
              BODY
          ================================================= */}

          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => {
              /* ---------------------------------------------
                 ITEM COUNT
              --------------------------------------------- */

              const itemCount =
                request.items?.reduce(
                  (total, item) =>
                    total + Number(item.quantity || 0),
                  0
                ) || 0;

              /* ---------------------------------------------
                 ACTION PERMISSIONS
              --------------------------------------------- */

              const isDraft =
                request.status === "Draft";

              const canEdit = isDraft;
              const canSubmit = isDraft;
              const canCancel = isDraft;

              return (
                <tr
                  key={request._id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  {/* =================================================
                      REQUEST
                  ================================================= */}

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        onView(request._id)
                      }
                      className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                    >
                      {request.orderNumber || "—"}
                    </button>

                    <p className="mt-1 text-xs text-slate-500">
                      {request.createdAt
                        ? new Date(
                            request.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </p>
                  </td>

                  {/* =================================================
                      SUPPLIER
                  ================================================= */}

                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {request.supplier?.name ||
                        "—"}
                    </p>

                    {request.supplier?.phone && (
                      <p className="mt-1 text-xs text-slate-500">
                        {request.supplier.phone}
                      </p>
                    )}
                  </td>

                  {/* =================================================
                      ITEMS
                  ================================================= */}

                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-slate-700">
                      {itemCount}
                    </span>

                    <p className="text-xs text-slate-500">
                      units
                    </p>
                  </td>

                  {/* =================================================
                      AMOUNT
                  ================================================= */}

                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-slate-800">
                      ₹
                      {Number(
                        request.totalAmount || 0
                      ).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </td>

                  {/* =================================================
                      EXPECTED DATE
                  ================================================= */}

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {request.expectedDate
                      ? new Date(
                          request.expectedDate
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  {/* =================================================
                      STATUS
                  ================================================= */}

                  <td className="px-5 py-4">
                    <PurchaseRequestStatus
                      status={request.status}
                    />
                  </td>

                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">

                      {/* VIEW */}

                      <button
                        type="button"
                        title="View Request"
                        aria-label="View Request"
                        onClick={() =>
                          onView(request._id)
                        }
                        disabled={actionLoading}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Eye size={17} />
                      </button>

                      {/* EDIT */}

                      {canEdit && (
                        <button
                          type="button"
                          title="Edit Request"
                          aria-label="Edit Request"
                          onClick={() =>
                            onEdit(request._id)
                          }
                          disabled={actionLoading}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Pencil size={17} />
                        </button>
                      )}

                      {/* SUBMIT */}

                      {canSubmit && (
                        <button
                          type="button"
                          title="Submit Request"
                          aria-label="Submit Request"
                          onClick={() =>
                            onSubmit(request)
                          }
                          disabled={actionLoading}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {actionLoading ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Send size={17} />
                          )}
                        </button>
                      )}

                      {/* CANCEL */}

                      {canCancel && (
                        <button
                          type="button"
                          title="Cancel Request"
                          aria-label="Cancel Request"
                          onClick={() =>
                            onCancel(request)
                          }
                          disabled={actionLoading}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <XCircle size={17} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseRequestTable;