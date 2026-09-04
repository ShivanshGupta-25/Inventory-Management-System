import { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PurchaseOrderActionMenu = ({
  order,
  onCancel,
}) => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
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

  const handleView = () => {
    setOpen(false);

    navigate(
      `/manager/purchase-orders/${order.id}`
    );
  };

  const handleEdit = () => {
    setOpen(false);

    navigate(
      `/manager/purchase-orders/${order.id}/edit`
    );
  };

  const handleCancel = () => {
    setOpen(false);

    onCancel(order);
  };

  const isCancelled =
    order.status === "Cancelled";

  return (
    <div
      ref={menuRef}
      className="relative flex justify-end"
    >
      <button
        type="button"
        onClick={() =>
          setOpen((prev) => !prev)
        }
        aria-label="Purchase order actions"
        aria-expanded={open}
        className={`rounded-lg p-2 transition ${
          open
            ? "bg-slate-100 text-slate-700"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        }`}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-slate-900/5">

          {/* View */}
          <button
            type="button"
            onClick={handleView}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Eye
              size={15}
              className="text-slate-400"
            />

            View Details
          </button>

          {/* Edit */}
          {!isCancelled && (
            <button
              type="button"
              onClick={handleEdit}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Pencil
                size={15}
                className="text-slate-400"
              />

              Edit Order
            </button>
          )}

          <div className="my-1 border-t border-slate-100" />

          {/* Cancel */}
          {!isCancelled ? (
            <button
              type="button"
              onClick={handleCancel}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <XCircle size={15} />

              Cancel Order
            </button>
          ) : (
            <div className="px-3.5 py-2.5 text-xs text-slate-400">
              Order already cancelled
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default PurchaseOrderActionMenu;