import {
  Package,
  BellRing,
  BarChart3,
  BrainCircuit,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Inventory Tracking",
    description:
      "Track products, stock quantities, categories, and inventory movements from one centralized dashboard.",
  },
  {
    icon: BellRing,
    title: "Smart Stock Alerts",
    description:
      "Get timely alerts when products reach low-stock levels so you can take action before stockouts occur.",
  },
  {
    icon: BarChart3,
    title: "Inventory Analytics",
    description:
      "Visualize stock movement, product performance, inventory value, and important business metrics.",
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered Insights",
    description:
      "Use intelligent analysis to identify inventory patterns, anomalies, and opportunities for better decisions.",
    highlighted: true,
  },
  {
    icon: TrendingUp,
    title: "Demand Forecasting",
    description:
      "Analyze historical inventory data to estimate future demand and support smarter stock planning.",
  },
  {
    icon: Users,
    title: "Supplier Management",
    description:
      "Organize supplier information and maintain better visibility into your procurement and inventory workflow.",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="bg-slate-50 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">
            Powerful Features
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to
            <span className="text-blue-600"> manage inventory</span>
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Manage your stock, understand your inventory data, and make
            better decisions with powerful tools designed for modern
            businesses.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className={`group rounded-2xl border p-7 transition duration-300 ${
                  feature.highlighted
                    ? "border-blue-200 bg-white shadow-md shadow-blue-100/50"
                    : "border-slate-200 bg-white hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg hover:shadow-slate-200/60"
                }`}
              >

                {/* Icon */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    feature.highlighted
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <Icon size={24} strokeWidth={1.9} />
                </div>

                {/* Content */}
                <h3 className="mt-6 text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>

                {/* Learn More */}
                <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
                  Learn more
                  <ArrowRight size={16} />
                </div>

              </div>
            );
          })}

        </div>

        {/* AI Highlight */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">

          <div className="grid items-center lg:grid-cols-2">

            {/* Content */}
            <div className="p-8 sm:p-10 lg:p-12">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <BrainCircuit size={23} />
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-blue-600">
                Intelligent Inventory
              </p>

              <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Turn inventory data into actionable insights.
              </h3>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Go beyond simply tracking stock. Analyze inventory
                patterns, identify unusual changes, understand demand
                trends, and get intelligent insights that help you
                optimize your inventory.
              </p>

              <a
                href="#contact"
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Learn More
                <ArrowRight size={17} />
              </a>

            </div>

            {/* Insight Preview */}
            <div className="border-t border-slate-200 bg-slate-50 p-8 lg:border-l lg:border-t-0 sm:p-10">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      AI Inventory Insights
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Recent analysis
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <BrainCircuit size={19} />
                  </div>
                </div>

                {/* Insight 1 */}
                <div className="mt-5 rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-amber-500" />

                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        Demand Increase Detected
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Product demand has increased over the last
                        7 days.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insight 2 */}
                <div className="mt-3 rounded-lg border border-green-100 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-green-500" />

                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        Healthy Stock Level
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Most high-demand products currently have
                        sufficient stock.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insight 3 */}
                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-blue-500" />

                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        Inventory Optimization
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        12 products may benefit from inventory
                        level adjustments.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Features;