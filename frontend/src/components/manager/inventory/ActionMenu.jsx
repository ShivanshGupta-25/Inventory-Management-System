import { useEffect, useRef } from "react";
import {
  MoreHorizontal,
  Eye,
  SlidersHorizontal,
  Pencil,
  History,
  Trash2,
} from "lucide-react";

const ActionMenu = ({
  product,
  open,
  onToggle,
  onView,
  onAdjust,
  onEdit,
  onHistory,
  onDelete,
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        if (open) {
          onToggle();
        }
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
  }, [open, onToggle]);

  const handleAction = (callback) => {
    if (callback) {
      callback(product);
    }

    onToggle();
  };

  return (
    <div
      ref={menuRef}
      className="relative inline-block"
    >
      <button
        type="button"
        onClick={onToggle}
        className={`rounded-lg p-2 transition ${
          open
            ? "bg-slate-100 text-slate-900"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        }`}
        title="Actions"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">

          {/* View Details */}
          <button
            type="button"
            onClick={() => {
              onView(product._id);
              onToggle();
            }}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <Eye size={16} />
            View Details
          </button>

          {/* Adjust Stock */}
          <button
            type="button"
            onClick={() => handleAction(onAdjust)}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <SlidersHorizontal size={16} />
            Adjust Stock
          </button>

          {/* Edit Product */}
          <button
            type="button"
            onClick={() => handleAction(onEdit)}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <Pencil size={16} />
            Edit Product
          </button>

          {/* Stock History */}
          {/* <button
            type="button"
            onClick={() => {
              onHistory(product._id);
              onToggle();
            }}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <History size={16} />
            Stock History
          </button>

          <div className="my-1 border-t border-slate-100" /> */}

          {/* Delete */}
          <button
            type="button"
            onClick={() => handleAction(onDelete)}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={16} />
            Delete
          </button>

        </div>
      )}
    </div>
  );
};

export default ActionMenu;