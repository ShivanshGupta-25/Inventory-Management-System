import {
  UserPlus,
  PackagePlus,
  BarChart3,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up and configure your inventory workspace according to your business requirements.",
  },
  {
    number: "02",
    icon: PackagePlus,
    title: "Add Your Inventory",
    description:
      "Add products, categories, suppliers, stock quantities, and other essential inventory details.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Track & Analyze",
    description:
      "Monitor stock levels, product movement, inventory trends, and important business metrics.",
  },
  {
    number: "04",
    icon: Lightbulb,
    title: "Make Smarter Decisions",
    description:
      "Use insights and alerts to reduce stockouts, prevent overstocking, and improve inventory efficiency.",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="bg-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">
            How It Works
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Manage your inventory
            <span className="text-blue-600"> in four simple steps</span>
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            From adding your first product to making data-driven
            decisions, everything you need is organized in one place.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16">

          {/* Connecting Line */}
          <div className="absolute left-[12%] right-[12%] top-16 hidden h-px bg-slate-200 lg:block" />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative text-center"
                >

                  {/* Icon */}
                  <div className="relative mx-auto flex h-32 w-32 items-center justify-center">

                    <div className="absolute inset-0 rounded-full bg-blue-50" />

                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm">
                      <Icon
                        size={30}
                        strokeWidth={1.8}
                        className="text-blue-600"
                      />
                    </div>

                    {/* Step Number */}
                    <span className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
                      {index + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                      Step {step.number}
                    </p>

                    <h3 className="mt-2 text-lg font-bold text-slate-900">
                      {step.title}
                    </h3>

                    <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </div>

                  {/* Mobile Arrow */}
                  {index < steps.length - 1 && (
                    <div className="mt-7 flex justify-center lg:hidden">
                      <ArrowRight
                        size={20}
                        className="rotate-90 text-slate-300"
                      />
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>

        {/* Bottom Highlight */}
        <div className="mt-16 rounded-2xl border border-blue-100 bg-slate-50 p-6 sm:p-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

            <div>
              <p className="text-lg font-bold text-slate-900">
                Everything you need to stay in control.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Keep your inventory organized, visible, and actionable.
              </p>
            </div>

            <a
              href="#features"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Explore Features
              <ArrowRight size={17} />
            </a>

          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
