import {
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const AdminSecurityCard = () => {
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <LockKeyhole size={20} />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">
            Account Security
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage password, authentication, sessions, and other
            security-related account settings.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Keep your administrator account secure
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Review your security configuration and account
              protection options from Settings.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate("/admin/settings")}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
      >
        Manage Security & Settings
        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </section>
  );
};

export default AdminSecurityCard;