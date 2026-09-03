import { Warehouse } from "lucide-react";
import { warehouses } from "../../../data/inventoryData";

const WarehouseSelector = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Warehouse size={16} className="text-slate-400" />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-sm font-medium text-slate-700 outline-none"
      >
        {warehouses.map((warehouse) => (
          <option key={warehouse}>{warehouse}</option>
        ))}
      </select>
    </div>
  );
};

export default WarehouseSelector;