import { Link } from "react-router-dom";
import {
  Package,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
} from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="border-t border-slate-200 bg-white">

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Package size={21} />
              </div>

              <div className="leading-tight">
                <h2 className="text-lg font-bold text-slate-900">
                  Inventory<span className="text-blue-600">Flow</span>
                </h2>

                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Smart Inventory Management
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
              A centralized inventory management platform designed
              to help businesses track stock, understand inventory
              trends, and make smarter decisions.
            </p>

            {/* Contact Details */}
            <div className="mt-6 space-y-3">

              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Mail
                  size={16}
                  className="text-blue-600"
                />
                support@inventoryflow.com
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Phone
                  size={16}
                  className="text-blue-600"
                />
                +91 00000 00000
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-500">
                <MapPin
                  size={16}
                  className="text-blue-600"
                />
                India
              </div>

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3">

              <li>
                <a
                  href="/#home"
                  className="text-sm text-slate-500 transition hover:text-blue-600"
                >
                  Home
                </a>
              </li>

              <li>
                <a
                  href="/#how-it-works"
                  className="text-sm text-slate-500 transition hover:text-blue-600"
                >
                  How It Works
                </a>
              </li>

              <li>
                <a
                  href="/#features"
                  className="text-sm text-slate-500 transition hover:text-blue-600"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="/#about"
                  className="text-sm text-slate-500 transition hover:text-blue-600"
                >
                  About
                </a>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="text-sm text-slate-500 transition hover:text-blue-600"
                >
                  Contact
                </Link>
              </li>

            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Account
            </h3>

            <ul className="mt-5 space-y-3">

              <li>
                <Link
                  to="/auth/login"
                  className="text-sm text-slate-500 transition hover:text-blue-600"
                >
                  Login
                </Link>
              </li>

              <li>
                <Link
                  to="/auth/signup"
                  className="text-sm text-slate-500 transition hover:text-blue-600"
                >
                  Create Account
                </Link>
              </li>

            </ul>

            {/* CTA */}
            <div className="mt-7">
              <Link
                to="/auth/signup"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} InventoryFlow. All rights reserved.
          </p>

          <div className="flex items-center gap-5">

            <Link
              to="/"
              className="text-xs text-slate-400 transition hover:text-blue-600"
            >
              Privacy
            </Link>

            <Link
              to="/"
              className="text-xs text-slate-400 transition hover:text-blue-600"
            >
              Terms
            </Link>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-blue-600"
            >
              Back to top
              <ArrowUp size={14} />
            </button>

          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;