import { History } from "lucide-react";

import OperationRow from "./OperationRow";

const RecentOperations = ({
  movements = [],
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}

      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <History
            size={16}
            className="text-slate-500"
          />

          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Recent Operations
            </h2>

            <p className="mt-1 text-[11px] text-slate-400">
              Latest stock movements
            </p>
          </div>
        </div>
      </div>

      {/* OPERATIONS */}

      {movements.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-xs text-slate-400">
            No stock operations yet.
          </p>
        </div>
      ) : (
        <div
          className="
            max-h-[520px]
            overflow-y-auto
            overscroll-contain
            scrollbar-thin
            scrollbar-track-slate-50
            scrollbar-thumb-slate-300
            hover:scrollbar-thumb-slate-400
          "
        >
          {movements.map((movement) => (
            <OperationRow
              key={movement._id}
              movement={movement}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOperations;