import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";

import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CircleHelp,
  Package,
  Headphones,
  ArrowRight,
} from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Contact Form:", formData);

    alert("Thank you! Your message has been submitted.");

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* =====================================================
          SHARED NAVBAR
      ====================================================== */}
      <Navbar />

      <main>

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="border-b border-slate-200 bg-slate-50">

          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">

            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">

              {/* LEFT */}
              <div className="max-w-xl">

                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Contact Us
                </div>

                <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Let's talk about your
                  <span className="block text-blue-600">
                    inventory needs.
                  </span>
                </h1>

                <p className="mt-4 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
                  Have a question about InventoryFlow, need help
                  getting started, or want to learn more about our
                  platform? Our team is here to help.
                </p>

              </div>


              {/* RIGHT - QUICK CONTACT */}
              <div className="grid gap-3 sm:grid-cols-3">

                {/* Sales */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Package size={17} />
                  </div>

                  <h3 className="mt-3 text-xs font-bold text-slate-900">
                    Sales & Plans
                  </h3>

                  <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                    Questions about plans, pricing, or choosing the
                    right solution.
                  </p>

                </div>


                {/* Product */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <CircleHelp size={17} />
                  </div>

                  <h3 className="mt-3 text-xs font-bold text-slate-900">
                    Product Help
                  </h3>

                  <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                    Get help with features, setup, and using the
                    platform.
                  </p>

                </div>


                {/* Support */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Headphones size={17} />
                  </div>

                  <h3 className="mt-3 text-xs font-bold text-slate-900">
                    Support
                  </h3>

                  <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                    Send us a message and we'll respond within 24
                    hours.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            CONTACT AREA
        ====================================================== */}
        <section className="px-5 py-10 sm:px-6 lg:px-8 lg:py-12">

          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">

            {/* =================================================
                CONTACT INFORMATION
            ================================================== */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-7">

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                Contact & Support
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                We're here to help.
              </h2>

              <p className="mt-2.5 text-sm leading-5 text-slate-500">
                Reach out to our team for product questions,
                support, or general enquiries.
              </p>


              {/* Contact Details */}
              <div className="mt-6 space-y-4">

                {/* Email */}
                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                    <Mail size={16} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Email
                    </p>

                    <p className="mt-0.5 text-xs font-medium text-slate-800">
                      support@inventoryflow.com
                    </p>
                  </div>

                </div>


                {/* Phone */}
                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                    <Phone size={16} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Phone
                    </p>

                    <p className="mt-0.5 text-xs font-medium text-slate-800">
                      +91 00000 00000
                    </p>
                  </div>

                </div>


                {/* Location */}
                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                    <MapPin size={16} />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Location
                    </p>

                    <p className="mt-0.5 text-xs font-medium text-slate-800">
                      India
                    </p>
                  </div>

                </div>

              </div>


              {/* Response Time */}
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-blue-100 bg-white p-3.5">

                <Clock
                  size={16}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Quick response
                  </p>

                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                    We aim to respond to all enquiries within
                    <span className="font-semibold text-slate-700">
                      {" "}24 hours.
                    </span>
                  </p>
                </div>

              </div>

            </div>


            {/* =================================================
                CONTACT FORM
            ================================================== */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                    Send a Message
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    Tell us how we can help
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Fill out the form and our team will get back to you.
                  </p>

                </div>

                <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 sm:flex">
                  <MessageSquare size={17} />
                </div>

              </div>


              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="mt-6"
              >

                {/* Name + Email */}
                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>


                  <div>

                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                </div>


                {/* Subject */}
                <div className="mt-4">

                  <label
                    htmlFor="subject"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What can we help with?"
                    required
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Message */}
                <div className="mt-4">

                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your question..."
                    required
                    className="w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* Submit */}
                <button
                  type="submit"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Send Message
                  <Send size={14} />
                </button>

                <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                  <Clock size={12} />
                  Typical response time: within 24 hours
                </p>

              </form>

            </div>

          </div>

        </section>


        {/* =====================================================
            FINAL CTA
        ====================================================== */}
        <section className="border-t border-slate-200 bg-slate-50 px-5 py-10 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Ready to take control of your inventory?
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-5 text-slate-500">
              Create your account and start managing your inventory
              from one centralized platform.
            </p>

            <Link
              to="/auth/signup"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Get Started
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

export default ContactPage;