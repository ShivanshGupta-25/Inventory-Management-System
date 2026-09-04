const PurchaseOrderFilters = ({
  status,
  supplier,
  onStatusChange,
  onSupplierChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">

      <select
        value={status}
        onChange={(e) =>
          onStatusChange(e.target.value)
        }
        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
      >
        <option>All Statuses</option>
        <option>Pending</option>
        <option>Approved</option>
        <option>Partially Received</option>
        <option>Received</option>
        <option>Cancelled</option>
      </select>


      <select
        value={supplier}
        onChange={(e) =>
          onSupplierChange(e.target.value)
        }
        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
      >
        <option>All Suppliers</option>
        <option>TechWorld Supplies</option>
        <option>Global Electronics</option>
        <option>OfficeMart</option>
        <option>Metro Stationery</option>
      </select>

    </div>
  );
};

export default PurchaseOrderFilters;