import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";
import SaleForm from "../../../components/manager/sales/SaleForm";

import {
  getSaleById,
  updateSale,
} from "../../../services/salesApi";

const EditSale = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [sale, setSale] = useState(null);
  const [inventory, setInventory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [saleResponse, inventoryResponse] =
          await Promise.all([
            getSaleById(id),
            fetch("http://localhost:5000/api/inventory").then(
              (res) => res.json()
            ),
          ]);

        const saleData =
          saleResponse.data || saleResponse;

        const inventoryData =
          inventoryResponse.data || [];

        setSale(saleData);
        setInventory(inventoryData);

        setFormData({
          customerName:
            saleData.customerName || "Walk-in Customer",

          customerContact:
            saleData.customerContact || "",

          discount:
            Number(saleData.discount || 0),

          tax:
            Number(saleData.tax || 0),

          paidAmount:
            Number(saleData.paidAmount || 0),

          paymentMethod:
            saleData.paymentMethod || "Cash",

          notes:
            saleData.notes || "",

          items:
            (saleData.items || []).map((item) => ({
              inventory:
                item.inventory?._id ||
                item.inventory,

              quantity:
                Number(item.quantity || 1),
            })),
        });
      } catch (err) {
        setError(
          err.message || "Failed to load sale"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const canEdit = useMemo(() => {
    if (!sale) return false;

    return (
      sale.status === "Completed" &&
      Number(sale.paidAmount || 0) === 0
    );
  }, [sale]);

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      setError("");

      await updateSale(id, {
        customerName: data.customerName,
        customerContact: data.customerContact,
        discount: Number(data.discount || 0),
        tax: Number(data.tax || 0),
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        items: data.items.map((item) => ({
          inventory: item.inventory,
          quantity: Number(item.quantity),
        })),
      });

      navigate(`/manager/sales/${id}`);
    } catch (err) {
      setError(
        err.message || "Failed to update sale"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ManagerSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCollapse={() =>
            setCollapsed((prev) => !prev)
          }
          onMobileClose={() =>
            setMobileOpen(false)
          }
        />

        <main
          className={`transition-all duration-300 ${
            collapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <ManagerHeader
            onMenuClick={() =>
              setMobileOpen(true)
            }
          />

          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="text-sm text-slate-500">
              Loading sale...
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !sale) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ManagerSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCollapse={() =>
            setCollapsed((prev) => !prev)
          }
          onMobileClose={() =>
            setMobileOpen(false)
          }
        />

        <main
          className={`transition-all duration-300 ${
            collapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <ManagerHeader
            onMenuClick={() =>
              setMobileOpen(true)
            }
          />

          <div className="p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ManagerSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCollapse={() =>
            setCollapsed((prev) => !prev)
          }
          onMobileClose={() =>
            setMobileOpen(false)
          }
        />

        <main
          className={`transition-all duration-300 ${
            collapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <ManagerHeader
            onMenuClick={() =>
              setMobileOpen(true)
            }
          />

          <div className="mx-auto max-w-[1600px] p-4 sm:p-6">
            <button
              onClick={() =>
                navigate(`/manager/sales/${id}`)
              }
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={17} />
              Back to Sale
            </button>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-lg font-semibold text-amber-900">
                Sale cannot be edited
              </h2>

              <p className="mt-2 text-sm text-amber-800">
                This sale can only be edited before any
                payment has been recorded.
              </p>

              <button
                onClick={() =>
                  navigate(`/manager/sales/${id}`)
                }
                className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                View Sale Details
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ManagerSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapse={() =>
          setCollapsed((prev) => !prev)
        }
        onMobileClose={() =>
          setMobileOpen(false)
        }
      />

      <main
        className={`transition-all duration-300 ${
          collapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >
        <ManagerHeader
          onMenuClick={() =>
            setMobileOpen(true)
          }
        />

        <div className="mx-auto max-w-[1600px] p-4 sm:p-6">

          {/* Breadcrumb */}
          <div className="mb-6">
            <p className="text-sm text-slate-500">
              Management / Sales / Edit Sale
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Edit Sale
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Update {sale.saleNumber}
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(`/manager/sales/${id}`)
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
                Back
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {formData && (
            <SaleForm
              mode="edit"
              initialData={formData}
              inventory={inventory}
              onSubmit={handleSubmit}
              loading={saving}
              submitLabel="Save Changes"
              submitIcon={Save}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default EditSale;