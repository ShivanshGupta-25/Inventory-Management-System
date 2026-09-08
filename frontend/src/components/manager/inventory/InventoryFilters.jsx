import { Search, RotateCcw } from "lucide-react";

const InventoryFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">

        {/* Search */}

        <div className="relative md:col-span-2">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search product or SKU..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        {/* Category */}

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
        >
          <option value="">
            All Categories
          </option>

          <option value="Electronics">
            Electronics
          </option>

          <option value="Accessories">
            Accessories
          </option>

          <option value="Office">
            Office
          </option>

          <option value="Storage">
            Storage
          </option>
        </select>

        {/* Status */}

        <div className="flex gap-2">

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
          >
            <option value="">
              All Stock Status
            </option>

            <option value="In Stock">
              In Stock
            </option>

            <option value="Low Stock">
              Low Stock
            </option>

            <option value="Out of Stock">
              Out of Stock
            </option>

            <option value="Overstock">
              Overstock
            </option>
          </select>

          <button
            onClick={onReset}
            title="Reset filters"
            className="rounded-xl border border-slate-200 bg-white px-3 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          >
            <RotateCcw size={16} />
          </button>

        </div>

      </div>
    </div>
  );
};

export default InventoryFilters;