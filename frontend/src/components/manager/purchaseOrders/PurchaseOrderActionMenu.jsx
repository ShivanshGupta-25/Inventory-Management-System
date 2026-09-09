import { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Edit3,
  CheckCircle,
  PackageCheck,
  XCircle,
} from "lucide-react";

const PurchaseOrderActionMenu = ({
  order,
  onView,
  onEdit,
  onConfirm,
  onReceive,
  onCancel,
}) => {
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

  const handleAction = (callback) => {
    setOpen(false);

    if (callback) {
      callback(order);
    }
  };

  const isDraft = order.status === "Draft";
  const isPending =
    order.status === "Pending" ||
    order.status === "Partially Received";

  return (
    <div
      ref={menuRef}
      className="relative flex justify-end"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <MoreHorizontal size={20} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {/* View Details */}
          <button
            type="button"
            onClick={() => handleAction(onView)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Eye size={17} />
            <span>View Details</span>
          </button>

          {/* Draft actions */}
          {isDraft && (
            <>
              <button
                type="button"
                onClick={() => handleAction(onEdit)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <Edit3 size={17} />
                <span>Edit Order</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction(onConfirm)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <CheckCircle size={17} />
                <span>Confirm Order</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction(onCancel)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <XCircle size={17} />
                <span>Cancel Order</span>
              </button>
            </>
          )}

          {/* Pending / Partially Received actions */}
          {isPending && (
            <>
              <button
                type="button"
                onClick={() => handleAction(onReceive)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <PackageCheck size={17} />
                <span>Receive Items</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction(onCancel)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <XCircle size={17} />
                <span>Cancel Order</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderActionMenu;