import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Eye,
  Edit3,
  CreditCard,
  XCircle,
  RotateCcw,
} from "lucide-react";

const SaleActionMenu = ({
  sale,
  onView,
  onEdit,
  onPayment,
  onCancel,
  onReturn,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!sale) return null;

  const isCompleted = sale.status === "Completed";
  const isCancelled = sale.status === "Cancelled";
  const isReturned = sale.status === "Returned";

  const paidAmount = Number(sale.paidAmount || 0);

  const canEdit =
    isCompleted &&
    paidAmount === 0;

  const canUpdatePayment =
    isCompleted &&
    sale.paymentStatus !== "Refunded" &&
    paidAmount < Number(sale.totalAmount || 0);

  const canCancel =
    isCompleted &&
    paidAmount === 0;

  const canReturn =
    isCompleted &&
    paidAmount > 0;

  const handleAction = (callback) => {
    setOpen(false);

    if (callback) {
      callback();
    }
  };

  return (
    <div
      className="relative inline-block text-left"
      ref={menuRef}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        aria-label="Sale actions"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">

          {/* View */}
          <button
            type="button"
            onClick={() => handleAction(onView)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Eye size={16} />
            View Details
          </button>

          {/* Edit */}
          {canEdit && (
            <button
              type="button"
              onClick={() => handleAction(onEdit)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Edit3 size={16} />
              Edit Sale
            </button>
          )}

          {/* Payment */}
          {canUpdatePayment && (
            <button
              type="button"
              onClick={() => handleAction(onPayment)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <CreditCard size={16} />
              Update Payment
            </button>
          )}

          {/* Cancel */}
          {canCancel && (
            <button
              type="button"
              onClick={() => handleAction(onCancel)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <XCircle size={16} />
              Cancel Sale
            </button>
          )}

          {/* Return */}
          {canReturn && (
            <button
              type="button"
              onClick={() => handleAction(onReturn)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50"
            >
              <RotateCcw size={16} />
              Return Sale
            </button>
          )}

          {/* No actions */}
          {(isCancelled || isReturned) && (
            <div className="px-4 py-3 text-xs text-slate-400">
              No actions available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SaleActionMenu;