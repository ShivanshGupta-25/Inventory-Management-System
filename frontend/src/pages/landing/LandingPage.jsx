import { motion } from "framer-motion";
// import {
//   ArrowRight,
//   BarChart3,
//   BrainCircuit,
//   Boxes,
//   ShieldCheck,
//   TrendingUp,
// } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../../components/common/Logo";

const features = [
  {
    // icon: Boxes,
    title: "Inventory Control",
    description:
      "Track products, stock levels, movements, and inventory health from one place.",
  },
  {
    // icon: BrainCircuit,
    title: "AI-Powered Insights",
    description:
      "Use intelligent predictions to understand future demand and inventory risks.",
  },
  {
    // icon: TrendingUp,
    title: "Demand Forecasting",
    description:
      "Identify demand patterns and make better stocking decisions.",
  },
  {
    // icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Visualize inventory trends, sales patterns, and operational performance.",
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Logo />

          <div className="flex items-center gap-3">
            <Link
              to="/auth/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Login
            </Link>

            <Link
              to="/auth/signup"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main>

        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0">
            <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute right-1/4 top-40 h-80 w-80 rounded-full bg-slate-400/10 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
                {/* <BrainCircuit size={16} /> */}
                Intelligent Inventory Management
              </div>

              <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-white lg:text-7xl">
                Manage inventory.
                <span className="block text-slate-400">
                  Predict what comes next.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
                A modern inventory management platform that combines
                real-time stock management, analytics, forecasting, and
                AI-powered insights.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/auth/signup"
                  className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Start Managing Inventory
                  {/* <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  /> */}
                </Link>

                <Link
                  to="/auth/login"
                  className="rounded-xl border border-slate-700 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-900"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">

                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                  <div>
                    <p className="text-xs text-slate-500">
                      INVENTORY OVERVIEW
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-white">
                      Business Dashboard
                    </h3>
                  </div>

                  <div className="rounded-lg bg-slate-800 px-3 py-2">
                    {/* <BarChart3 size={18} className="text-slate-300" /> */}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  {[
                    ["Total Products", "1,284"],
                    ["Stock Value", "$84.2K"],
                    ["Low Stock", "24"],
                    ["Predicted Demand", "+18.4%"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-2 text-xl font-bold text-white">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-300">
                      Demand Trend
                    </p>

                    <span className="text-xs text-slate-500">
                      Last 30 days
                    </span>
                  </div>

                  <div className="mt-5 flex h-28 items-end gap-2">
                    {[35, 48, 42, 60, 55, 72, 66, 82, 75, 91, 85, 96].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t bg-slate-600"
                          style={{ height: `${height}%` }}
                        />
                      )
                    )}
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              One intelligent platform
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
              Everything you need to manage inventory
            </h2>

            <p className="mt-4 text-slate-600">
              From everyday stock operations to AI-powered forecasting,
              everything is connected in one platform.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
            //   const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                    {/* {Icon && <Icon size={21} />} */}
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </section>

        {/* CTA */}
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-5xl px-6 py-20 text-center">
            {/* <ShieldCheck
              className="mx-auto text-slate-700"
              size={32}
            /> */}

            <h2 className="mt-5 text-3xl font-bold text-slate-900">
              Build smarter inventory operations
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-slate-600">
              Get started with a role-based inventory management workspace
              designed for modern teams.
            </p>

            <Link
              to="/auth/signup"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800"
            >
              Create Your Account
              {/* <ArrowRight size={18} /> */}
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <Logo />

          <p className="text-sm text-slate-500">
            © 2026 StockFlow. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;