import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Package,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import StaffSidebar from "../../../components/staff/StaffSidebar";
import StaffHeader from "../../../components/staff/StaffHeader";

import PurchaseRequestForm from "../../../components/staff/purchaseRequests/PurchaseRequestForm";

import {
  createStaffPurchaseRequest,
  getStaffPurchaseRequestById,
  updateStaffPurchaseRequest,
} from "../../../services/staffPurchaseRequestApi";

const API_URL = "http://localhost:5000/api";

/* =====================================================
   AUTH HEADERS
===================================================== */

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

/* =====================================================
   COMPONENT
===================================================== */

const CreatePurchaseRequest = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  /* =====================================================
     SIDEBAR
  ===================================================== */

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* =====================================================
     INVENTORY
  ===================================================== */

  const [inventories, setInventories] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

  /* =====================================================
     EXISTING REQUEST
  ===================================================== */

  const [initialData, setInitialData] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(false);

  /* =====================================================
     FORM / API STATE
  ===================================================== */

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD INVENTORY
  ===================================================== */

  const loadInventory = useCallback(async () => {
    try {
      setLoadingInventory(true);
      setError("");

      const response = await axios.get(`${API_URL}/inventory`, {
        headers: getAuthHeaders(),
      });

      console.log("Inventory API response:", response.data);

      let inventoryData = [];

      if (Array.isArray(response.data)) {
        inventoryData = response.data;
      } else if (Array.isArray(response.data?.data)) {
        inventoryData = response.data.data;
      } else if (Array.isArray(response.data?.inventory)) {
        inventoryData = response.data.inventory;
      } else if (Array.isArray(response.data?.items)) {
        inventoryData = response.data.items;
      } else if (
        Array.isArray(response.data?.data?.inventory)
      ) {
        inventoryData = response.data.data.inventory;
      } else if (
        Array.isArray(response.data?.data?.items)
      ) {
        inventoryData = response.data.data.items;
      }

      const activeInventory = inventoryData.filter(
        (item) =>
          item.status === undefined ||
          item.status === "Active"
      );

      console.log("Inventory products:", activeInventory);

      setInventories(activeInventory);
    } catch (err) {
      console.error("Failed to load inventory:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load inventory products."
      );
    } finally {
      setLoadingInventory(false);
    }
  }, []);

  /* =====================================================
     LOAD EXISTING REQUEST IN EDIT MODE
  ===================================================== */

  const loadExistingRequest = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingRequest(true);

      const response = await getStaffPurchaseRequestById(id);

      const request =
        response?.data ||
        response?.purchaseOrder ||
        response?.order;

      if (!request) {
        throw new Error(
          "Purchase request could not be found."
        );
      }

      if (request.status !== "Draft") {
        throw new Error(
          "Only Draft purchase requests can be edited."
        );
      }

      setInitialData(request);
    } catch (err) {
      console.error(
        "Failed to load purchase request:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load purchase request."
      );
    } finally {
      setLoadingRequest(false);
    }
  }, [id]);

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    if (isEditMode) {
      loadExistingRequest();
    }
  }, [isEditMode, loadExistingRequest]);

  /* =====================================================
     STOCK ALERTS
  ===================================================== */

  const stockAlerts = useMemo(() => {
    return inventories
      .map((item) => {
        const currentStock = Number(
          item.currentStock ??
            item.stock ??
            item.quantity ??
            item.availableQuantity ??
            0
        );

        const minimumStock = Number(
          item.minimumStock ??
            item.minStock ??
            item.reorderLevel ??
            item.lowStockThreshold ??
            item.minimumQuantity ??
            0
        );

        const reorderQuantity = Number(
          item.reorderQuantity ??
            item.reorderQty ??
            item.suggestedOrderQuantity ??
            Math.max(minimumStock * 2 - currentStock, 0)
        );

        const isLowStock =
          minimumStock > 0 &&
          currentStock <= minimumStock;

        const isOutOfStock = currentStock <= 0;

        if (!isLowStock && !isOutOfStock) {
          return null;
        }

        return {
          ...item,
          currentStock,
          minimumStock,
          reorderQuantity,
          isOutOfStock,
        };
      })
      .filter(Boolean);
  }, [inventories]);

  /* =====================================================
     CREATE OR UPDATE PURCHASE REQUEST
  ===================================================== */

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      setError("");

      if (isEditMode) {
        await updateStaffPurchaseRequest(id, data);

        navigate(`/staff/purchase-requests/${id}`);
      } else {
        const response =
          await createStaffPurchaseRequest(data);

        console.log(
          "Purchase request created:",
          response
        );

        const createdRequest =
          response?.data ||
          response?.purchaseOrder ||
          response?.order;

        const requestId = createdRequest?._id;

        if (requestId) {
          navigate(
            `/staff/purchase-requests/${requestId}`
          );
        } else {
          navigate("/staff/purchase-requests");
        }
      }
    } catch (err) {
        console.error(
            "Failed to save purchase request:",
            err
        );

        console.error(
            "Backend response:",
            err?.response?.data
        );

        setError(
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to save purchase request."
        );
        } finally {
        setSaving(false);
        }
    };

  /* =====================================================
     BACK HANDLER
  ===================================================== */

  const handleBack = () => {
    if (isEditMode) {
      navigate(`/staff/purchase-requests/${id}`);
    } else {
      navigate("/staff/purchase-requests");
    }
  };

  /* =====================================================
     RETRY HANDLER
  ===================================================== */

  const handleRetry = () => {
    setError("");
    loadInventory();

    if (isEditMode) {
      loadExistingRequest();
    }
  };

  const isLoading = loadingInventory || loadingRequest;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =================================================
          SIDEBAR
      ================================================= */}

      <StaffSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onCollapse={() =>
          setSidebarCollapsed((prev) => !prev)
        }
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <StaffHeader
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6">
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-6">
            <button
              type="button"
              onClick={handleBack}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />

              {isEditMode
                ? "Back to Request"
                : "Back to Purchase Requests"}
            </button>

            <p className="text-xs font-medium text-slate-400">
              Purchase Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {isEditMode
                ? "Edit Purchase Request"
                : "New Purchase Request"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Request additional inventory from your manager.
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Unable to continue
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                </div>

                {!saving && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </button>
                )}
              </div>
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <RefreshCw className="h-5 w-5 animate-spin text-slate-600" />
              </div>

              <p className="text-sm font-medium text-slate-700">
                Loading purchase request information...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Fetching inventory and stock information.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  STOCK ALERTS
              ================================================= */}

              {stockAlerts.length > 0 && (
                <section className="mb-6 overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-amber-100 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-amber-100 p-2">
                        <AlertTriangle className="h-5 w-5 text-amber-700" />
                      </div>

                      <div>
                        <h2 className="text-sm font-bold text-amber-900">
                          Stock Alerts
                        </h2>

                        <p className="mt-1 text-xs text-amber-700">
                          These products have reached or fallen below
                          their minimum stock level.
                        </p>
                      </div>
                    </div>

                    <span className="w-fit rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                      {stockAlerts.length}{" "}
                      {stockAlerts.length === 1
                        ? "Product"
                        : "Products"}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left">
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Product
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            SKU
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Current Stock
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Minimum Stock
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Suggested Quantity
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Alert
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {stockAlerts.map((item) => (
                          <tr
                            key={item._id || item.id || item.sku}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-slate-900">
                                {item.name ||
                                  item.productName ||
                                  item.product?.name ||
                                  "Unnamed Product"}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {item.sku ||
                                item.productSku ||
                                item.product?.sku ||
                                "—"}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`text-sm font-semibold ${
                                  item.isOutOfStock
                                    ? "text-red-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {item.currentStock}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {item.minimumStock || "—"}
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                              {item.reorderQuantity || "—"}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  item.isOutOfStock
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {item.isOutOfStock
                                  ? "Out of Stock"
                                  : "Low Stock"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* =================================================
                  NO STOCK ALERTS
              ================================================= */}

              {stockAlerts.length === 0 &&
                inventories.length > 0 && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <Package className="mt-0.5 h-5 w-5 text-emerald-600" />

                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        Inventory levels look good
                      </p>

                      <p className="mt-1 text-xs text-emerald-700">
                        No low-stock products were detected in the
                        currently loaded inventory.
                      </p>
                    </div>
                  </div>
                )}

              {/* =================================================
                  EMPTY INVENTORY
              ================================================= */}

              {inventories.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Package className="h-5 w-5 text-slate-400" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    No inventory products available
                  </h3>

                  <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                    No active inventory products were returned by
                    the inventory API. Please try again or contact
                    your manager.
                  </p>

                  <button
                    type="button"
                    onClick={loadInventory}
                    disabled={saving}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reload Inventory
                  </button>
                </div>
              ) : (
                /* =================================================
                    PURCHASE REQUEST FORM
                ================================================= */

                <PurchaseRequestForm
                  inventories={inventories}
                  initialData={initialData}
                  onSubmit={handleSubmit}
                  loading={saving}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreatePurchaseRequest;