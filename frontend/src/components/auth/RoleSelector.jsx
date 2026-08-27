import {
  ShieldCheck,
  ClipboardList,
  UserRound,
} from "lucide-react";

const roles = [
  {
    id: "admin",
    title: "Administrator",
    description: "Full system access and management",
    icon: ShieldCheck,
  },
  {
    id: "manager",
    title: "Inventory Manager",
    description: "Inventory, products, suppliers and analytics",
    icon: ClipboardList,
  },
  {
    id: "staff",
    title: "Staff",
    description: "Daily inventory and operational activities",
    icon: UserRound,
  },
];

const RoleSelector = ({ selectedRole, onSelect }) => {
  return (
    <div>
      <label className="mb-3 block text-sm font-semibold text-slate-700">
        Select your role
      </label>

      <div className="space-y-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const selected = selectedRole === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelect(role.id)}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                  : "border-slate-200 bg-white hover:border-slate-400"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  selected
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon size={19} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {role.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {role.description}
                </p>
              </div>

              <div
                className={`h-4 w-4 rounded-full border ${
                  selected
                    ? "border-slate-900 bg-slate-900"
                    : "border-slate-300"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;