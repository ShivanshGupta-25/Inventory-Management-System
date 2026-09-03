import { MoreHorizontal, Eye, Edit3 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const InventoryActionMenu = ({ product }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <MoreHorizontal size={17} />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
          <button
            onClick={() =>
              navigate(`/manager/inventory/${product.id}`)
            }
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
          >
            <Eye size={14} />
            View Details
          </button>

          <button
            onClick={() =>
              navigate(
                `/manager/inventory/${product.id}/adjust`
              )
            }
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
          >
            <Edit3 size={14} />
            Adjust Stock
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryActionMenu;