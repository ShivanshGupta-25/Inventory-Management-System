import { Boxes } from "lucide-react";

const Logo = ({ light = false }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          light
            ? "bg-white text-slate-900"
            : "bg-slate-900 text-white"
        }`}
      >
        <Boxes size={22} strokeWidth={2.2} />
      </div>

      <div>
        <h1
          className={`text-lg font-bold leading-none ${
            light ? "text-white" : "text-slate-900"
          }`}
        >
          Smart Manager
        </h1>

        <p
          className={`mt-1 text-[10px] font-medium uppercase tracking-[0.18em] ${
            light ? "text-slate-300" : "text-slate-500"
          }`}
        >
          Inventory Intelligence
        </p>
      </div>
    </div>
  );
};

export default Logo;