const SupplierSelect = ({ value, onChange }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Supplier
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
      >
        <option value="">
          Select a supplier
        </option>

        <option value="TechWorld Supplies">
          TechWorld Supplies
        </option>

        <option value="Global Electronics">
          Global Electronics
        </option>

        <option value="OfficeMart">
          OfficeMart
        </option>

        <option value="Metro Stationery">
          Metro Stationery
        </option>
      </select>
    </div>
  );
};

export default SupplierSelect;