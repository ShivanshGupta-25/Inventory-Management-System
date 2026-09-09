import {
  Search,
  RotateCcw,
} from "lucide-react";

const SalesFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  paymentStatus,
  setPaymentStatus,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

      <div className="flex flex-col gap-3 md:flex-row">

        {/* Search */}

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search sale or customer..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
          />
        </div>

        {/* Status */}

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300"
        >
          <option value="">
            All Status
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Cancelled">
            Cancelled
          </option>

          <option value="Returned">
            Returned
          </option>
        </select>

        {/* Payment */}

        <select
          value={paymentStatus}
          onChange={(e) =>
            setPaymentStatus(e.target.value)
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300"
        >
          <option value="">
            All Payments
          </option>

          <option value="Paid">
            Paid
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Partial">
            Partial
          </option>

          <option value="Refunded">
            Refunded
          </option>
        </select>

        {/* Reset */}

        <button
          onClick={onReset}
          title="Reset filters"
          className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
        >
          <RotateCcw size={17} />
        </button>

      </div>

    </div>
  );
};

export default SalesFilters;