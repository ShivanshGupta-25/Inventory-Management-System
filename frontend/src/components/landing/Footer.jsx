import { Link } from "react-router-dom";
import {
  Package,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  ArrowUp,
  CheckCircle2,
} from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="border-t border-white/10 bg-[#0A0A2E] text-slate-400">

      {/* =====================================================
          MAIN FOOTER
      ====================================================== */}
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">

        <div className="grid gap-12 lg:grid-cols-12">

          {/* =================================================
              BRAND / DESCRIPTION
          ================================================== */}
          <div className="lg:col-span-5">

            {/* Logo */}
            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Package size={20} strokeWidth={2.2} />
              </div>

              <div className="leading-tight">

                <h2 className="text-lg font-bold tracking-tight text-white">
                  Inventory
                  <span className="text-blue-500">Flow</span>
                </h2>

                <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-slate-600">
                  Smart Inventory Management
                </p>

              </div>

            </Link>


            {/* Description */}
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
              A modern inventory management platform that helps
              businesses track stock, understand demand, and make
              smarter operational decisions.
            </p>


            {/* Contact Information */}
            <div className="mt-6 space-y-3">

              <a
                href="mailto:support@inventoryflow.com"
                className="flex items-center gap-3 text-xs text-slate-500 transition hover:text-slate-300"
              >
                <Mail
                  size={15}
                  className="text-slate-600"
                />

                support@inventoryflow.com
              </a>


              <a
                href="tel:+910000000000"
                className="flex items-center gap-3 text-xs text-slate-500 transition hover:text-slate-300"
              >
                <Phone
                  size={15}
                  className="text-slate-600"
                />

                +91 00000 00000
              </a>


              <div className="flex items-center gap-3 text-xs text-slate-500">
                <MapPin
                  size={15}
                  className="text-slate-600"
                />

                India
              </div>

            </div>

          </div>


          {/* =================================================
              PRODUCT
          ================================================== */}
          <div className="lg:col-span-2">

            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300">
              Product
            </h3>

            <ul className="mt-5 space-y-3.5">

              <li>
                <a
                  href="/#features"
                  className="text-sm text-slate-500 transition hover:text-white"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="/#how-it-works"
                  className="text-sm text-slate-500 transition hover:text-white"
                >
                  How It Works
                </a>
              </li>

              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-slate-500 transition hover:text-white"
                >
                  Pricing
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="text-sm text-slate-500 transition hover:text-white"
                >
                  Contact
                </Link>
              </li>

            </ul>

          </div>


          {/* =================================================
              COMPANY
          ================================================== */}
          <div className="lg:col-span-2">

            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300">
              Company
            </h3>

            <ul className="mt-5 space-y-3.5">

              <li>
                <a
                  href="/#home"
                  className="text-sm text-slate-500 transition hover:text-white"
                >
                  Home
                </a>
              </li>

              <li>
                <a
                  href="/#about"
                  className="text-sm text-slate-500 transition hover:text-white"
                >
                  About Us
                </a>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="text-sm text-slate-500 transition hover:text-white"
                >
                  Get in Touch
                </Link>
              </li>

            </ul>

          </div>


          {/* =================================================
              ACCOUNT / CTA
          ================================================== */}
          <div className="lg:col-span-3">

            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300">
              Get Started
            </h3>


            {/* CTA Box */}
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">

              <div className="flex items-start gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <CheckCircle2 size={16} />
                </div>

                <div>

                  <p className="text-sm font-semibold text-white">
                    Ready to get started?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Start managing your inventory smarter today.
                  </p>

                </div>

              </div>


              <Link
                to="/auth/signup"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Create Account
                <ArrowUpRight size={14} />
              </Link>

            </div>


            {/* Login */}
            <Link
              to="/auth/login"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-white"
            >
              Already have an account?
              <span className="text-blue-400">
                Sign in
              </span>
            </Link>

          </div>

        </div>

      </div>


      {/* =====================================================
          BOTTOM FOOTER
      ====================================================== */}
      <div className="border-t border-white/[0.07]">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">

          {/* Copyright */}
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} InventoryFlow. All rights reserved.
          </p>


          {/* Bottom Links */}
          <div className="flex items-center gap-5">

            <Link
              to="/"
              className="text-xs text-slate-600 transition hover:text-slate-300"
            >
              Privacy
            </Link>

            <Link
              to="/"
              className="text-xs text-slate-600 transition hover:text-slate-300"
            >
              Terms
            </Link>

            <button
              onClick={scrollToTop}
              className="group flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-white"
            >
              Back to top

              <ArrowUp
                size={13}
                className="transition-transform group-hover:-translate-y-0.5"
              />
            </button>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;