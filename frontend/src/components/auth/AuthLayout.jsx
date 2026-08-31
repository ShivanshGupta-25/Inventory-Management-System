import { Package } from "lucide-react";
import { Link } from "react-router-dom";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">

          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Package size={20} />
            </div>

            <div className="leading-tight">
              <h1 className="text-base font-bold text-slate-900">
                Inventory<span className="text-blue-600">Flow</span>
              </h1>

              <p className="hidden text-[9px] font-medium uppercase tracking-wider text-slate-400 sm:block">
                Smart Inventory Management
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            Back to Home
          </Link>

        </div>
      </header>

      {/* Page Content */}
      <main>
        {children}
      </main>

    </div>
  );
};

export default AuthLayout;