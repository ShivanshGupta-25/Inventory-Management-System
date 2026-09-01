import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  X,
  ArrowRight,
  Zap,
  Building2,
  Crown,
  HelpCircle,
} from "lucide-react";

import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = [
    {
      name: "Starter",
      description:
        "Essential tools for small businesses starting with inventory management.",
      icon: Zap,
      monthly: 499,
      yearly: 399,
      popular: false,
      features: [
        "Up to 500 products",
        "Basic inventory tracking",
        "Stock level monitoring",
        "Low-stock alerts",
        "Basic dashboard",
        "1 user",
      ],
    },
    {
      name: "Professional",
      description:
        "Advanced tools for growing businesses that need smarter inventory insights.",
      icon: Crown,
      monthly: 999,
      yearly: 799,
      popular: true,
      features: [
        "Up to 5,000 products",
        "Advanced inventory tracking",
        "Demand forecasting",
        "Stockout prediction",
        "Overstock prediction",
        "Inventory analytics",
        "Smart alerts",
        "Up to 5 users",
      ],
    },
    {
      name: "Business",
      description:
        "Powerful inventory intelligence for larger and complex operations.",
      icon: Building2,
      monthly: 1999,
      yearly: 1599,
      popular: false,
      features: [
        "Unlimited products",
        "Advanced analytics",
        "AI-powered forecasting",
        "Demand & trend analysis",
        "Inventory classification",
        "Anomaly detection",
        "Priority support",
        "Unlimited users",
      ],
    },
  ];

  const comparison = [
    {
      feature: "Inventory Tracking",
      starter: true,
      professional: true,
      business: true,
    },
    {
      feature: "Low Stock Alerts",
      starter: true,
      professional: true,
      business: true,
    },
    {
      feature: "Dashboard & Reports",
      starter: "Basic",
      professional: "Advanced",
      business: "Advanced",
    },
    {
      feature: "Demand Forecasting",
      starter: false,
      professional: true,
      business: true,
    },
    {
      feature: "Stockout Prediction",
      starter: false,
      professional: true,
      business: true,
    },
    {
      feature: "Overstock Prediction",
      starter: false,
      professional: true,
      business: true,
    },
    {
      feature: "Anomaly Detection",
      starter: false,
      professional: false,
      business: true,
    },
    {
      feature: "Smart Alerts",
      starter: "Basic",
      professional: true,
      business: true,
    },
    {
      feature: "Users",
      starter: "1",
      professional: "5",
      business: "Unlimited",
    },
    {
      feature: "Priority Support",
      starter: false,
      professional: false,
      business: true,
    },
  ];

  const faqs = [
    {
      question: "Can I change my plan later?",
      answer:
        "Yes. You can upgrade or downgrade your plan as your inventory requirements change.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes. You can start with a trial to explore the core inventory management features before choosing a paid plan.",
    },
    {
      question: "Can I cancel my subscription?",
      answer:
        "Yes. You can cancel at any time and continue using your plan until the current billing period ends.",
    },
    {
      question: "Which plan is right for me?",
      answer:
        "Starter is ideal for smaller operations, Professional for growing businesses, and Business for larger inventory operations.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* =====================================================
          SHARED NAVBAR
      ====================================================== */}
      <Navbar />


      {/* =====================================================
          HERO
      ====================================================== */}
      <main>

        <section className="bg-slate-50 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">

          <div className="mx-auto max-w-3xl text-center">

            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-600">
              <Zap size={13} />
              Simple & Transparent Pricing
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Plans that scale with{" "}
              <span className="text-blue-600">
                your business
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Start with the essentials and upgrade when your
              inventory operations grow.
            </p>

            {/* Billing Toggle */}
            <div className="mt-6 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">

              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                  billingCycle === "monthly"
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                  billingCycle === "yearly"
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Yearly

                <span
                  className={`ml-1.5 ${
                    billingCycle === "yearly"
                      ? "text-blue-100"
                      : "text-green-600"
                  }`}
                >
                  Save 20%
                </span>
              </button>

            </div>

          </div>

        </section>


        {/* =====================================================
            PRICING CARDS
        ====================================================== */}
        <section className="px-5 py-10 sm:px-6 lg:px-8 lg:py-12">

          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">

            {plans.map((plan) => {

              const Icon = plan.icon;

              const price =
                billingCycle === "monthly"
                  ? plan.monthly
                  : plan.yearly;

              return (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-xl border bg-white p-5 ${
                    plan.popular
                      ? "border-blue-500 shadow-lg shadow-blue-100/60"
                      : "border-slate-200 shadow-sm"
                  }`}
                >

                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-semibold text-white">
                      Most Popular
                    </div>
                  )}

                  {/* Icon */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon size={18} />
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-slate-900">
                    {plan.name}
                  </h2>

                  <p className="mt-1.5 min-h-[40px] text-xs leading-5 text-slate-500">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-4 flex items-end gap-1">

                    <span className="text-3xl font-bold tracking-tight text-slate-950">
                      ₹{price}
                    </span>

                    <span className="mb-1 text-xs text-slate-400">
                      /month
                    </span>

                  </div>

                  {billingCycle === "yearly" && (
                    <p className="mt-1 text-[10px] font-medium text-green-600">
                      Billed annually
                    </p>
                  )}

                  {/* CTA */}
                  <Link
                    to="/auth/signup"
                    className={`mt-4 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Get Started
                    <ArrowRight size={13} />
                  </Link>

                  <div className="my-4 border-t border-slate-100" />

                  <p className="text-xs font-semibold text-slate-900">
                    What's included
                  </p>

                  <ul className="mt-3 space-y-2.5">

                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2"
                      >
                        <Check
                          size={14}
                          className="mt-0.5 shrink-0 text-green-500"
                        />

                        <span className="text-xs leading-4 text-slate-600">
                          {feature}
                        </span>
                      </li>
                    ))}

                  </ul>

                </div>
              );
            })}

          </div>

        </section>


        {/* =====================================================
            COMPARISON
        ====================================================== */}
        <section className="bg-slate-50 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">

          <div className="mx-auto max-w-6xl">

            <div className="text-center">

              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                Compare Plans
              </p>

              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">
                Compare features
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                See what is included in each plan.
              </p>

            </div>


            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[680px] border-collapse">

                  <thead>

                    <tr className="border-b border-slate-200 bg-slate-50">

                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">
                        Feature
                      </th>

                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-900">
                        Starter
                      </th>

                      <th className="px-4 py-3 text-center text-xs font-semibold text-blue-600">
                        Professional
                      </th>

                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-900">
                        Business
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {comparison.map((row, index) => (

                      <tr
                        key={row.feature}
                        className={
                          index !== comparison.length - 1
                            ? "border-b border-slate-100"
                            : ""
                        }
                      >

                        <td className="px-4 py-3 text-xs font-medium text-slate-700">
                          {row.feature}
                        </td>

                        {[row.starter, row.professional, row.business].map(
                          (value, valueIndex) => (

                            <td
                              key={valueIndex}
                              className="px-4 py-3 text-center"
                            >

                              {value === true ? (
                                <Check
                                  size={15}
                                  className="mx-auto text-green-500"
                                />
                              ) : value === false ? (
                                <X
                                  size={15}
                                  className="mx-auto text-slate-300"
                                />
                              ) : (
                                <span className="text-xs font-medium text-slate-600">
                                  {value}
                                </span>
                              )}

                            </td>
                          )
                        )}

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            FAQ
        ====================================================== */}
        <section className="px-5 py-10 sm:px-6 lg:px-8 lg:py-12">

          <div className="mx-auto max-w-3xl">

            <div className="text-center">

              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <HelpCircle size={18} />
              </div>

              <h2 className="mt-3 text-2xl font-bold text-slate-950">
                Frequently asked questions
              </h2>

              <p className="mt-1.5 text-xs text-slate-500">
                Common questions about InventoryFlow pricing.
              </p>

            </div>


            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              {faqs.map((faq) => (

                <div
                  key={faq.question}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >

                  <h3 className="text-xs font-semibold text-slate-900">
                    {faq.question}
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {faq.answer}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* =====================================================
            FINAL CTA
        ====================================================== */}
        <section className="px-5 pb-10 sm:px-6 lg:px-8 lg:pb-12">

          <div className="mx-auto max-w-5xl rounded-xl bg-blue-600 px-6 py-8 text-center shadow-lg shadow-blue-100 sm:px-10">

            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Ready to manage your inventory smarter?
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-blue-100">
              Start with InventoryFlow and bring your stock,
              analytics, and inventory decisions into one platform.
            </p>

            <Link
              to="/auth/signup"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Start Free
              <ArrowRight size={14} />
            </Link>

          </div>

        </section>

      </main>


      {/* =====================================================
          SHARED FOOTER
      ====================================================== */}
      <Footer />

    </div>
  );
};

export default PricingPage;