import { useState } from "react";
import Navbar from "../../components/landing/Navbar";

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
    
    <div className="min-h-screen bg-slate-50 text-slate-900">

      <Navbar />

      {/* =====================================================
          HERO / INTRO SECTION
      ====================================================== */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">

          <div className="grid items-center gap-10 lg:grid-cols-2">

            {/* LEFT - INTRO */}
            <div className="max-w-2xl">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Contact Us
              </div>

              {/* Heading */}
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Let's build a better
                <span className="block text-blue-600">
                  inventory experience.
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Whether you're exploring our inventory management
                platform, need help getting started, or have a question
                for our team, we're here to help you move forward.
              </p>

            </div>

            {/* RIGHT - QUICK CONTACT CARDS */}
            <div className="grid gap-4 sm:grid-cols-3 lg:gap-3">

              {/* Sales */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Package size={19} />
                </div>

                <h3 className="mt-5 text-sm font-bold text-slate-900">
                  Sales & Plans
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Talk to us about plans, pricing, and finding the
                  right solution for your business.
                </p>

              </div>

              {/* Product */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CircleHelp size={19} />
                </div>

                <h3 className="mt-5 text-sm font-bold text-slate-900">
                  Product Guidance
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Have questions about features, setup, or using the
                  inventory system?
                </p>

              </div>

              {/* Support */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Headphones size={19} />
                </div>

                <h3 className="mt-5 text-sm font-bold text-slate-900">
                  Quick Response
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Send us a message and our team will get back to
                  you within 24 hours.
                </p>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT + FORM SECTION
      ====================================================== */}
      <section className="py-14 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-2 lg:px-8">

          {/* =================================================
              LEFT - CONTACT INFORMATION
          ================================================== */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 p-7 sm:p-8 lg:p-10">

            {/* Decorative Circle */}
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/60" />

            <div className="relative">

              {/* Small Heading */}
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Contact & Support
              </p>

              <h2 className="mt-3 text-2xl font-bold text-slate-950">
                Let's talk.
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                Whether you have a question about the platform or
                need help getting started, our team is here to assist
                you.
              </p>

              {/* Divider */}
              <div className="my-7 h-px bg-blue-100" />

              {/* EMAIL */}
              <div className="flex gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600">
                  <Mail size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    General Enquiries
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    support@inventoryflow.com
                  </p>
                </div>

              </div>

              {/* Divider */}
              <div className="my-5 h-px bg-blue-100" />

              {/* PHONE */}
              <div className="flex gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600">
                  <Phone size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    +91 00000 00000
                  </p>
                </div>

              </div>

              {/* Divider */}
              <div className="my-5 h-px bg-blue-100" />

              {/* LOCATION */}
              <div className="flex gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600">
                  <MapPin size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    India
                  </p>
                </div>

              </div>

              {/* Support Message */}
              <div className="mt-7 rounded-xl border border-blue-100 bg-white/70 p-4">

                <div className="flex items-start gap-3">

                  <Clock
                    size={17}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <p className="text-xs leading-5 text-slate-600">
                    We aim to respond to all enquiries within
                    <span className="font-semibold text-slate-900">
                      {" "}24 hours.
                    </span>
                  </p>

                </div>

              </div>

            </div>
          </div>

          {/* =================================================
              RIGHT - CONTACT FORM
          ================================================== */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8 lg:p-10">

            {/* Form Header */}
            <div className="flex items-start justify-between gap-5">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                  Send a Message
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Tell us what you need
                </h2>
              </div>

              <MessageSquare
                size={22}
                className="mt-1 text-blue-500"
              />

            </div>

            <p className="mt-3 text-sm text-slate-500">
              Fill out the form below and we'll get back to you soon.
            </p>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="mt-7"
            >

              {/* NAME + EMAIL */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-semibold text-slate-700"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold text-slate-700"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

              </div>

              {/* SUBJECT */}
              <div className="mt-5">

                <label
                  htmlFor="subject"
                  className="mb-2 block text-xs font-semibold text-slate-700"
                >
                  Subject
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* MESSAGE */}
              <div className="mt-5">

                <label
                  htmlFor="message"
                  className="mb-2 block text-xs font-semibold text-slate-700"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more..."
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* SUBMIT */}
              <div className="mt-6">

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                >
                  Send Message
                  <Send size={17} />
                </button>

              </div>

              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Clock size={14} />
                We'll get back to you within 24 hours.
              </p>

            </form>

          </div>

        </div>
      </section>

      {/* =====================================================
          BOTTOM CTA
      ====================================================== */}
      <section className="border-t border-slate-200 bg-white py-14">

        <div className="mx-auto max-w-3xl px-6 text-center">

          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
            Ready to take control of your inventory?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Create your account and start managing your inventory
            from one centralized platform.
          </p>

          <a
            href="/auth/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Get Started
            <Send size={17} />
          </a>

        </div>

      </section>

    </div>
  );
};

export default ContactPage;