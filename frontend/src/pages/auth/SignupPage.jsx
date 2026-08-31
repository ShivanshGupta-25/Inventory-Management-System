import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  UserCog,
  Users,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Package,
  BarChart3,
  Boxes,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";

const SignupPage = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const userData = {
      ...formData,
      role: selectedRole,
    };

    console.log("Signup:", userData);

    // Temporary role-based navigation
    if (selectedRole === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <AuthLayout>
      <section className="min-h-[calc(100vh-64px)] bg-slate-50 px-6 py-10 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-144px)] max-w-6xl items-center gap-12 lg:grid-cols-2">

          {/* =====================================================
              LEFT SIDE - BRAND / INFORMATION
          ====================================================== */}
          <div className="hidden lg:block">

            <div className="max-w-lg">

              {/* Logo */}
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Package size={22} />
                </div>

                <div>
                  <p className="text-base font-bold tracking-tight text-slate-950">
                    Inventory
                  </p>

                  <p className="text-xs font-medium text-blue-600">
                    Management System
                  </p>
                </div>

              </div>

              {/* Main Heading */}
              <h2 className="mt-10 text-4xl font-bold leading-tight tracking-tight text-slate-950">
                Start managing your
                <span className="block text-blue-600">
                  inventory smarter.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
                Create your account and bring your products, stock,
                orders, and inventory insights together in one
                centralized platform.
              </p>

              {/* Benefits */}
              <div className="mt-8 space-y-4">

                {/* Benefit 1 */}
                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Boxes size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Centralized Inventory
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Keep all your inventory information organized.
                    </p>
                  </div>

                </div>

                {/* Benefit 2 */}
                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BarChart3 size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Useful Analytics
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Monitor stock and understand inventory trends.
                    </p>
                  </div>

                </div>

                {/* Benefit 3 */}
                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <TrendingUp size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Better Decisions
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Make informed decisions with your inventory data.
                    </p>
                  </div>

                </div>

              </div>

              {/* Trust Message */}
              <div className="mt-10 border-t border-slate-200 pt-6">

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2
                    size={15}
                    className="text-blue-500"
                  />

                  <span>
                    Simple, centralized, and efficient inventory management.
                  </span>
                </div>

              </div>

            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE - SIGNUP FORM
          ====================================================== */}
          <div className="mx-auto w-full max-w-md">

            {/* Mobile Logo */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Package size={20} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-950">
                  Inventory
                </p>

                <p className="text-[11px] font-medium text-blue-600">
                  Management System
                </p>
              </div>

            </div>

            {/* Heading */}
            <div className="text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserPlus size={23} />
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                Create your account
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Set up your InventoryFlow account to get started.
              </p>

            </div>

            {/* Signup Card */}
            <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <form onSubmit={handleSubmit}>

                {/* =================================================
                    ROLE SELECTION
                ================================================== */}
                <div>

                  <div className="mb-3">

                    <h3 className="text-sm font-semibold text-slate-900">
                      Choose your role
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Select the role that best describes your
                      responsibilities.
                    </p>

                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">

                    {/* ADMIN */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole("admin")}
                      className={`relative rounded-xl border p-4 text-left transition ${
                        selectedRole === "admin"
                          ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-100"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >

                      {selectedRole === "admin" && (
                        <CheckCircle2
                          size={17}
                          className="absolute right-3 top-3 text-blue-600"
                        />
                      )}

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <UserCog size={20} />
                      </div>

                      <h4 className="mt-3 text-sm font-bold text-slate-900">
                        Administrator
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Manage inventory, users, suppliers, analytics,
                        and settings.
                      </p>

                    </button>

                    {/* STAFF */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole("staff")}
                      className={`relative rounded-xl border p-4 text-left transition ${
                        selectedRole === "staff"
                          ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-100"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >

                      {selectedRole === "staff" && (
                        <CheckCircle2
                          size={17}
                          className="absolute right-3 top-3 text-blue-600"
                        />
                      )}

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <Users size={20} />
                      </div>

                      <h4 className="mt-3 text-sm font-bold text-slate-900">
                        Staff
                      </h4>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Handle products, stock updates, orders, and
                        daily operations.
                      </p>

                    </button>

                  </div>
                </div>

                {/* =================================================
                    FULL NAME
                ================================================== */}
                <div className="mt-6">

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Full Name
                  </label>

                  <div className="relative">

                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>
                </div>

                {/* =================================================
                    EMAIL
                ================================================== */}
                <div className="mt-5">

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>
                </div>

                {/* =================================================
                    PASSWORD
                ================================================== */}
                <div className="mt-5">

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>
                </div>

                {/* =================================================
                    CONFIRM PASSWORD
                ================================================== */}
                <div className="mt-5">

                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>
                </div>

                {/* =================================================
                    TERMS
                ================================================== */}
                <div className="mt-5 flex items-start gap-2">

                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <label
                    htmlFor="terms"
                    className="text-xs leading-5 text-slate-500"
                  >
                    I agree to the platform's terms and conditions
                    and privacy policy.
                  </label>

                </div>

                {/* =================================================
                    SUBMIT
                ================================================== */}
                <button
                  type="submit"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Create Account
                  <ArrowRight size={17} />
                </button>

              </form>

              {/* =================================================
                  LOGIN LINK
              ================================================== */}
              <div className="mt-6 border-t border-slate-100 pt-6 text-center">

                <p className="text-sm text-slate-500">
                  Already have an account?{" "}

                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Sign in
                  </Link>
                </p>

              </div>

            </div>

            {/* Security */}
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">

              <CheckCircle2 size={14} />

              Your account information is securely handled.

            </div>

          </div>

        </div>
      </section>
    </AuthLayout>
  );
};

export default SignupPage;