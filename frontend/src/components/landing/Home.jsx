import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Package,
  TrendingUp,
} from "lucide-react";

const Home = () => {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-slate-50"
    >
      {/* Background decoration */}
      <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">

        {/* Left Content */}
        <div>
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-600" />

            <span className="text-sm font-medium text-slate-600">
              Smart Inventory Management
            </span>
          </div>

          {/* Heading */}
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Manage Inventory.
            <br />

            <span className="text-blue-600">
              Make Smarter Decisions.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            A centralized inventory management platform that helps you
            track stock, monitor products, analyze demand, and make
            data-driven inventory decisions with ease.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/auth/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              See How It Works
            </a>
          </div>

          {/* Benefits */}
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2
                size={17}
                className="text-blue-600"
              />
              Real-time tracking
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2
                size={17}
                className="text-blue-600"
              />
              Smart analytics
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2
                size={17}
                className="text-blue-600"
              />
              Easy to use
            </div>
          </div>
        </div>

        {/* Right Dashboard Preview */}
        <div className="relative">
          {/* Main Dashboard Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">

            {/* Dashboard Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Package
                    size={20}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Inventory Overview
                  </p>

                  <p className="text-xs text-slate-400">
                    Today's summary
                  </p>
                </div>
              </div>

              <div className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                Live
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 py-5 sm:grid-cols-3">

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <Boxes size={18} className="text-blue-600" />
                </div>

                <p className="text-2xl font-bold text-slate-900">
                  1,248
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Total Products
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                  <TrendingUp
                    size={18}
                    className="text-green-600"
                  />
                </div>

                <p className="text-2xl font-bold text-slate-900">
                  86%
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Stock Health
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 col-span-2 sm:col-span-1">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                  <BarChart3
                    size={18}
                    className="text-indigo-600"
                  />
                </div>

                <p className="text-2xl font-bold text-slate-900">
                  24.6K
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Units in Stock
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="rounded-xl border border-slate-100 p-4">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Inventory Trends
                  </p>

                  <p className="text-xs text-slate-400">
                    Stock movement this week
                  </p>
                </div>

                <span className="text-xs font-medium text-green-600">
                  +12.8%
                </span>
              </div>

              {/* Simple Chart */}
              <div className="flex h-32 items-end gap-2 sm:gap-3">

                {[45, 65, 52, 78, 62, 88, 96].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex flex-1 items-end"
                    >
                      <div
                        className="w-full rounded-t-md bg-blue-100"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    </div>
                  )
                )}

              </div>

              <div className="mt-3 flex justify-between text-[10px] text-slate-400">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* Floating Alert */}
          <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg sm:block">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <Package
                  size={18}
                  className="text-amber-600"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Low Stock Alert
                </p>

                <p className="text-[11px] text-slate-500">
                  8 products need attention
                </p>
              </div>
            </div>
          </div>

          {/* Floating Growth Card */}
          <div className="absolute -right-5 -top-5 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-lg sm:block">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                <TrendingUp
                  size={18}
                  className="text-green-600"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Stock Efficiency
                </p>

                <p className="text-[11px] text-green-600">
                  +18.4% this month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;