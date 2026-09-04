import { useEffect, useState } from "react";
import {
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import PurchaseOrderStatusBadge from "./PurchaseOrderStatusBadge";
import PurchaseOrderActionMenu from "./PurchaseOrderActionMenu";

import { purchaseOrderData } from "../../../data/purchaseOrderData";

const PurchaseOrderTable = ({ orders }) => {
  const [cancelOrder, setCancelOrder] =
    useState(null);

  // Pagination
  const [currentPage, setCurrentPage] =
    useState(1);

  const ordersPerPage = 5;

  // Calculate total pages
  const totalPages = Math.ceil(
    orders.length / ordersPerPage
  );

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [orders]);

  // Make sure current page stays valid
  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Calculate pagination indexes
  const startIndex =
    (currentPage - 1) * ordersPerPage;

  const endIndex =
    startIndex + ordersPerPage;

  // Orders shown on current page
  const paginatedOrders = orders.slice(
    startIndex,
    endIndex
  );

  // Cancel order
  const handleConfirmCancel = () => {
    if (!cancelOrder) return;

    const order = purchaseOrderData.find(
      (item) =>
        item.id === cancelOrder.id
    );

    if (order) {
      order.status = "Cancelled";
    }

    setCancelOrder(null);

    window.location.reload();
  };

  // Previous page
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(
        (prev) => prev - 1
      );
    }
  };

  // Next page
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(
        (prev) => prev + 1
      );
    }
  };

  // Specific page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      pages.push(page);
    }

    return pages;
  };

  // Display range
  const displayStart =
    orders.length === 0
      ? 0
      : startIndex + 1;

  const displayEnd =
    Math.min(
      endIndex,
      orders.length
    );

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Purchase Orders
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Track and manage supplier purchase orders
            </p>
          </div>

          <span className="text-xs text-slate-400">
            {orders.length} orders
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  PO Number
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Supplier
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Items
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Total
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Order Date
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Expected
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                  >

                    {/* PO Number */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-blue-600">
                        {order.id}
                      </p>
                    </td>

                    {/* Supplier */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {order.supplier}
                      </p>
                    </td>

                    {/* Items */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-600">
                        {order.items} items
                      </p>

                      <p className="text-[10px] text-slate-400">
                        {order.quantity} units
                      </p>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      ₹
                      {order.total.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    {/* Order Date */}
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {order.orderDate}
                    </td>

                    {/* Expected */}
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {order.expectedDate}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <PurchaseOrderStatusBadge
                        status={order.status}
                      />
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      <PurchaseOrderActionMenu
                        order={order}
                        onCancel={setCancelOrder}
                      />
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-slate-600">
                      No purchase orders found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

        {/* Showing Count */}
        <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-600">
            {displayStart}
            </span>
            {" - "}
            <span className="font-semibold text-slate-600">
            {displayEnd}
            </span>
            {" of "}
            <span className="font-semibold text-slate-600">
            {orders.length}
            </span>
            {" purchase orders"}
        </p>

        {/* Pagination Controls */}
        <div className="flex items-center gap-1">

            {/* Previous */}
            <button
            type="button"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
            <ChevronLeft size={14} />
            Previous
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page) => (
            <button
                key={page}
                type="button"
                onClick={() =>
                handlePageChange(page)
                }
                className={`min-w-8 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                currentPage === page
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
            >
                {page}
            </button>
            ))}

            {/* Next */}
            <button
            type="button"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
            Next
            <ChevronRight size={14} />
            </button>

        </div>

        </div>

      </div>

      {/* Cancel Confirmation Modal */}
      {cancelOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                  <AlertTriangle size={20} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Cancel Purchase Order?
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    This action will mark the order as cancelled.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setCancelOrder(null)
                }
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>

            </div>

            {/* Modal Body */}
            <div className="p-5">

              <div className="rounded-lg bg-slate-50 p-4">

                <p className="text-xs text-slate-400">
                  Purchase Order
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {cancelOrder.id}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {cancelOrder.supplier}
                </p>

              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Are you sure you want to cancel this purchase
                order? This order will no longer be available
                for processing.
              </p>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-5">

              <button
                type="button"
                onClick={() =>
                  setCancelOrder(null)
                }
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Keep Order
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                className="rounded-lg bg-red-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-600"
              >
                Yes, Cancel Order
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default PurchaseOrderTable;