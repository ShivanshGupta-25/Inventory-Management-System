import { Link } from "react-router-dom";
import {
  Package,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  ArrowRight,
  // Linkedin,
  // Github,
  // Twitter,
} from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">

      {/* =====================================================
          MAIN FOOTER
      ====================================================== */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">

          {/* =================================================
              BRAND
          ================================================== */}
          <div className="lg:col-span-5">

            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Package size={21} />
              </div>

              <div className="leading-tight">
                <h2 className="text-lg font-bold text-white">
                  Inventory
                  <span className="text-blue-400">Flow</span>
                </h2>

                <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-500">
                  Smart Inventory Management
                </p>
              </div>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
              A centralized inventory management platform designed
              to help businesses track stock, understand inventory
              trends, and make smarter decisions.
            </p>

            {/* Contact */}
            <div className="mt-5 space-y-2.5">

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Mail
                  size={15}
                  className="shrink-0 text-blue-400"
                />
                <span>support@inventoryflow.com</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Phone
                  size={15}
                  className="shrink-0 text-blue-400"
                />
                <span>+91 00000 00000</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <MapPin
                  size={15}
                  className="shrink-0 text-blue-400"
                />
                <span>India</span>
              </div>

            </div>

            {/* Social */}
            {/* <div className="mt-5 flex items-center gap-2">

              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-blue-500 hover:text-blue-400"
              >
                <Linkedin size={15} />
              </a>

              <a
                href="#"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-blue-500 hover:text-blue-400"
              >
                <Github size={15} />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-blue-500 hover:text-blue-400"
              >
                <Twitter size={15} />
              </a>

            </div> */}

          </div>


          {/* =================================================
              PRODUCT
          ================================================== */}
          <div className="lg:col-span-2">

            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Product
            </h3>

            <ul className="mt-4 space-y-3">

              <li>
                <a
                  href="/#features"
                  className="text-xs text-slate-400 transition hover:text-blue-400"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="/#how-it-works"
                  className="text-xs text-slate-400 transition hover:text-blue-400"
                >
                  How It Works
                </a>
              </li>

              <li>
                <Link
                  to="/pricing"
                  className="text-xs text-slate-400 transition hover:text-blue-400"
                >
                  Pricing
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="text-xs text-slate-400 transition hover:text-blue-400"
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

            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Company
            </h3>

            <ul className="mt-4 space-y-3">

              <li>
                <a
                  href="/#home"
                  className="text-xs text-slate-400 transition hover:text-blue-400"
                >
                  Home
                </a>
              </li>

              <li>
                <a
                  href="/#about"
                  className="text-xs text-slate-400 transition hover:text-blue-400"
                >
                  About Us
                </a>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="text-xs text-slate-400 transition hover:text-blue-400"
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

            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Account
            </h3>

            <ul className="mt-4 space-y-3">

              <li>
                <Link
                  to="/auth/login"
                  className="text-xs text-slate-400 transition hover:text-blue-400"
                >
                  Sign In
                </Link>
              </li>

              <li>
                <Link
                  to="/auth/signup"
                  className="text-xs text-slate-400 transition hover:text-blue-400"
                >
                  Create Account
                </Link>
              </li>

            </ul>

            {/* CTA */}
            <Link
              to="/auth/signup"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              Get Started
              <ArrowRight size={13} />
            </Link>

          </div>

        </div>

      </div>


      {/* =====================================================
          BOTTOM FOOTER
      ====================================================== */}
      <div className="border-t border-slate-800">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">

          {/* Copyright */}
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} InventoryFlow. All rights reserved.
          </p>


          {/* Bottom Links */}
          <div className="flex items-center gap-5">

            <Link
              to="/"
              className="text-[11px] text-slate-500 transition hover:text-blue-400"
            >
              Privacy
            </Link>

            <Link
              to="/"
              className="text-[11px] text-slate-500 transition hover:text-blue-400"
            >
              Terms
            </Link>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 transition hover:text-blue-400"
            >
              Back to top
              <ArrowUp size={13} />
            </button>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;