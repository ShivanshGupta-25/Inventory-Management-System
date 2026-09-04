import { useState } from "react";
import { Eye, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

const SaleActionMenu = ({ sale }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex justify-end">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            <Link
              to={`/manager/sales/${sale.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <Eye size={15} />
              View Details
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default SaleActionMenu;