import { Search } from "lucide-react";

const PurchaseOrderSearch = ({
  value,
  onChange,
}) => {
  return (
    <div className="relative w-full">
      <Search
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search purchase orders..."
        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50"
      />
    </div>
  );
};

export default PurchaseOrderSearch;