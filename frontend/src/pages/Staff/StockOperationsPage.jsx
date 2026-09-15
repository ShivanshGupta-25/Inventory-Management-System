import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

import StockOperationTabs from "../../components/staff/stockOperations/StockOperationTabs";
import StockOperationForm from "../../components/staff/stockOperations/StockOperationForm";
import OperationReviewModal from "../../components/staff/stockOperations/OperationReviewModal";
import RecentOperations from "../../components/staff/stockOperations/RecentOperations";

import {
  getInventory,
  stockIn,
  stockOut,
} from "../../services/inventoryService";

import {
  getStockHistory,
} from "../../services/staffActivityApi";

const StockOperationsPage = () => {
  const [operationType, setOperationType] =
    useState("IN");

  const [inventory, setInventory] =
    useState([]);

  const [movements, setMovements] =
    useState([]);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [reviewOpen, setReviewOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        inventoryResponse,
        historyResponse,
      ] = await Promise.all([
        getInventory(),
        getStockHistory({
          limit: 10,
        }),
      ]);

      setInventory(
        inventoryResponse?.data ||
          inventoryResponse ||
          []
      );

      setMovements(
        historyResponse || []
      );
    } catch (err) {
      console.error(
        "Failed to load stock operations:",
        err
      );

      setError(
        err.message ||
          "Failed to load stock operation data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */

  const filteredProducts = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return inventory;
    }

    return inventory.filter(
      (product) =>
        product.productName
          ?.toLowerCase()
          .includes(value) ||
        product.sku
          ?.toLowerCase()
          .includes(value)
    );
  }, [inventory, search]);

  /* =====================================================
     CHANGE OPERATION TYPE
  ===================================================== */

  const handleOperationChange = (
    type
  ) => {
    setOperationType(type);

    setSelectedProduct(null);
    setSearch("");
    setQuantity("");
    setReason("");
    setNotes("");
    setError("");
    setSuccess("");
  };

  /* =====================================================
     SELECT PRODUCT
  ===================================================== */

  const handleProductChange = (
    product
  ) => {
    setSelectedProduct(product);
    setSearch(product.productName || "");
    setQuantity("");
    setError("");
    setSuccess("");
  };

  /* =====================================================
     REVIEW
  ===================================================== */

  const handleReview = () => {
    setError("");
    setSuccess("");

    if (!selectedProduct) {
      setError("Please select a product.");
      return;
    }

    const numericQuantity =
      Number(quantity);

    if (
      !Number.isFinite(
        numericQuantity
      ) ||
      numericQuantity <= 0
    ) {
      setError(
        "Quantity must be greater than 0."
      );
      return;
    }

    if (!reason) {
      setError("Please select a reason.");
      return;
    }

    if (
      operationType === "OUT" &&
      numericQuantity >
        Number(
          selectedProduct.currentStock || 0
        )
    ) {
      setError(
        "Requested quantity exceeds available stock."
      );
      return;
    }

    setReviewOpen(true);
  };

  /* =====================================================
     CONFIRM OPERATION
  ===================================================== */

  const handleConfirm = async () => {
    if (!selectedProduct) return;

    try {
      setSubmitting(true);
      setError("");

      const numericQuantity =
        Number(quantity);

      const payload = {
        quantity: numericQuantity,
        reason,
      };

      let response;

      if (operationType === "IN") {
        response = await stockIn(
          selectedProduct._id,
          numericQuantity,
          reason,
          notes
        );
      } else {
        response = await stockOut(
          selectedProduct._id,
          numericQuantity,
          reason,
          notes
        );
      }

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Stock operation failed."
        );
      }

      setSuccess(
        operationType === "IN"
          ? "Stock added successfully."
          : "Stock removed successfully."
      );

      setReviewOpen(false);

      setQuantity("");
      setReason("");
      setNotes("");
      setSelectedProduct(null);
      setSearch("");

      await loadData();
    } catch (err) {
      console.error(
        "Stock operation failed:",
        err
      );

      setError(
        err.message ||
          "Failed to complete stock operation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <StaffSidebar />

      <div className="lg:pl-64">
        <StaffHeader />

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-[1400px]">

            {/* PAGE HEADER */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Workspace
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  Stock Operations
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage incoming and outgoing inventory.
                </p>
              </div>

              <StockOperationTabs
                operationType={
                  operationType
                }
                onChange={
                  handleOperationChange
                }
              />
            </div>

            {/* FEEDBACK */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-xs font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs font-medium text-emerald-700">
                  {success}
                </p>
              </div>
            )}

            {/* MAIN CONTENT */}
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                <p className="text-sm text-slate-500">
                  Loading stock operations...
                </p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">

                {/* FORM */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          operationType ===
                          "IN"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {operationType ===
                        "IN" ? (
                          <ArrowDownToLine
                            size={17}
                          />
                        ) : (
                          <ArrowUpFromLine
                            size={17}
                          />
                        )}
                      </div>

                      <div>
                        <h2 className="text-sm font-bold text-slate-800">
                          {operationType ===
                          "IN"
                            ? "Stock In"
                            : "Stock Out"}
                        </h2>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {operationType ===
                          "IN"
                            ? "Add incoming stock to inventory."
                            : "Remove issued stock from inventory."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <StockOperationForm
                      operationType={
                        operationType
                      }
                      products={
                        filteredProducts
                      }
                      selectedProduct={
                        selectedProduct
                      }
                      onProductChange={
                        handleProductChange
                      }
                      search={search}
                      onSearchChange={
                        setSearch
                      }
                      quantity={quantity}
                      onQuantityChange={
                        setQuantity
                      }
                      reason={reason}
                      onReasonChange={
                        setReason
                      }
                      notes={notes}
                      onNotesChange={
                        setNotes
                      }
                      onReview={
                        handleReview
                      }
                    />
                  </div>
                </div>

                {/* RECENT OPERATIONS */}
                <RecentOperations
                  movements={movements}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* REVIEW MODAL */}
      <OperationReviewModal
        open={reviewOpen}
        operationType={
          operationType
        }
        product={selectedProduct}
        quantity={quantity}
        reason={reason}
        notes={notes}
        loading={submitting}
        onClose={() =>
          setReviewOpen(false)
        }
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default StockOperationsPage;