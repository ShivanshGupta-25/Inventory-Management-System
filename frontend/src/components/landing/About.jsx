import {
  CheckCircle2,
  Target,
  ShieldCheck,
  Zap,
} from "lucide-react";

const About = () => {
  const benefits = [
    "Centralized inventory management",
    "Real-time stock visibility",
    "Data-driven inventory decisions",
    "Intelligent alerts and insights",
  ];

  return (
    <section
      id="about"
      className="bg-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className="grid items-center gap-14 lg:grid-cols-2">

          {/* Left Content */}
          <div>
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">
              About Our Platform
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simplifying the way businesses
              <span className="text-blue-600">
                {" "}manage inventory.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Our Inventory Management System is designed to help
              businesses maintain better control over their stock,
              products, suppliers, and inventory operations through
              one centralized platform.
            </p>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-500">
              By combining inventory tracking, analytics, intelligent
              alerts, and demand insights, the platform helps reduce
              operational complexity and supports smarter inventory
              planning.
            </p>

            {/* Benefits */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2.5"
                >
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-blue-600"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Cards */}
          <div className="grid gap-4 sm:grid-cols-2">

            {/* Mission */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Target size={22} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Our Mission
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Make inventory management simpler, more transparent,
                and accessible for businesses of different sizes.
              </p>
            </div>

            {/* Security */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <ShieldCheck size={22} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Reliable Management
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Keep important inventory information organized and
                accessible while maintaining a structured workflow.
              </p>
            </div>

            {/* Efficiency */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 sm:col-span-2">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Zap size={22} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Built for Better Efficiency
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Reduce manual inventory work, identify potential
                    stock issues earlier, and spend more time making
                    important business decisions instead of managing
                    spreadsheets.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:grid-cols-3">

          <div className="border-b border-slate-200 p-6 text-center sm:border-b-0 sm:border-r">
            <p className="text-2xl font-bold text-slate-900">
              100%
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Centralized Management
            </p>
          </div>

          <div className="border-b border-slate-200 p-6 text-center sm:border-b-0 sm:border-r">
            <p className="text-2xl font-bold text-slate-900">
              Real-Time
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Inventory Visibility
            </p>
          </div>

          <div className="p-6 text-center">
            <p className="text-2xl font-bold text-slate-900">
              Smart
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Data-Driven Insights
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default About;