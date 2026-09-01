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
  BriefcaseBusiness,
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
      <section className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-3 sm:px-6">

        <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-5xl items-center gap-6 lg:grid-cols-2">

          {/* =====================================================
              LEFT SIDE - BRAND / INFORMATION
          ====================================================== */}
          <div className="hidden lg:block">

            <div className="max-w-sm">

              {/* Logo */}
              <div className="flex items-center gap-2.5">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                  <Package size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold tracking-tight text-slate-950">
                    Inventory
                  </p>

                  <p className="text-[10px] font-medium text-blue-600">
                    Management System
                  </p>
                </div>

              </div>

              {/* Heading */}
              <h2 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-slate-950">
                Start managing your
                <span className="block text-blue-600">
                  inventory smarter.
                </span>
              </h2>

              <p className="mt-2.5 max-w-sm text-xs leading-5 text-slate-600">
                Create your account and bring your products, stock,
                orders, and inventory insights together in one
                centralized platform.
              </p>

              {/* Benefits */}
              <div className="mt-5 space-y-2.5">

                {/* Benefit 1 */}
                <div className="flex items-center gap-2.5">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Boxes size={15} />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-900">
                      Centralized Inventory
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Keep all your inventory information organized.
                    </p>
                  </div>

                </div>

                {/* Benefit 2 */}
                <div className="flex items-center gap-2.5">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <BarChart3 size={15} />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-900">
                      Useful Analytics
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Monitor stock and understand inventory trends.
                    </p>
                  </div>

                </div>

                {/* Benefit 3 */}
                <div className="flex items-center gap-2.5">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <TrendingUp size={15} />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-900">
                      Better Decisions
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Make informed decisions with your inventory data.
                    </p>
                  </div>

                </div>

              </div>

              {/* Trust Message */}
              <div className="mt-5 border-t border-slate-200 pt-3">

                <div className="flex items-center gap-2 text-[10px] text-slate-400">

                  <CheckCircle2
                    size={12}
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
          <div className="mx-auto w-full max-w-[360px]">

            {/* Mobile Logo */}
            <div className="mb-4 flex items-center justify-center gap-2 lg:hidden">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Package size={16} />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-950">
                  Inventory
                </p>

                <p className="text-[9px] font-medium text-blue-600">
                  Management System
                </p>
              </div>

            </div>


            {/* Heading */}
            <div className="text-center">

              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <UserPlus size={18} />
              </div>

              <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                Create your account
              </h1>

              <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                Set up your InventoryFlow account to get started.
              </p>

            </div>


            {/* =================================================
                SIGNUP CARD
            ================================================== */}
            <div className="mt-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

              <form onSubmit={handleSubmit}>

                {/* Role Selection */}
                <div>

                  <div className="mb-1.5">
                    <h3 className="text-[11px] font-semibold text-slate-900">
                      Sign in as
                    </h3>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                      Choose your role to continue.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">

                    {/* Administrator */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole("admin")}
                      className={`relative rounded-lg border p-2 text-left transition ${
                        selectedRole === "admin"
                          ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-100"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {selectedRole === "admin" && (
                        <CheckCircle2
                          size={11}
                          className="absolute right-1.5 top-1.5 text-blue-600"
                        />
                      )}

                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                        <UserCog size={14} />
                      </div>

                      <p className="mt-1.5 text-[10px] font-bold text-slate-900">
                        Administrator
                      </p>

                      <p className="mt-0.5 text-[8px] leading-3 text-slate-500">
                        Full system access
                      </p>
                    </button>


                    {/* Manager */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole("manager")}
                      className={`relative rounded-lg border p-2 text-left transition ${
                        selectedRole === "manager"
                          ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-100"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {selectedRole === "manager" && (
                        <CheckCircle2
                          size={11}
                          className="absolute right-1.5 top-1.5 text-blue-600"
                        />
                      )}

                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-100 text-violet-600">
                        <BriefcaseBusiness size={14} />
                      </div>

                      <p className="mt-1.5 text-[10px] font-bold text-slate-900">
                        Manager
                      </p>

                      <p className="mt-0.5 text-[8px] leading-3 text-slate-500">
                        Manage operations
                      </p>
                    </button>


                    {/* Staff */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole("staff")}
                      className={`relative rounded-lg border p-2 text-left transition ${
                        selectedRole === "staff"
                          ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-100"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {selectedRole === "staff" && (
                        <CheckCircle2
                          size={11}
                          className="absolute right-1.5 top-1.5 text-blue-600"
                        />
                      )}

                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                        <Users size={14} />
                      </div>

                      <p className="mt-1.5 text-[10px] font-bold text-slate-900">
                        Staff
                      </p>

                      <p className="mt-0.5 text-[8px] leading-3 text-slate-500">
                        Daily operations
                      </p>
                    </button>

                  </div>

                </div>


                {/* Full Name */}
                <div className="mt-3">

                  <label
                    htmlFor="name"
                    className="mb-1 block text-[11px] font-medium text-slate-700"
                  >
                    Full Name
                  </label>

                  <div className="relative">

                    <User
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                </div>


                {/* Email */}
                <div className="mt-2.5">

                  <label
                    htmlFor="email"
                    className="mb-1 block text-[11px] font-medium text-slate-700"
                  >
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                </div>


                {/* Password */}
                <div className="mt-2.5">

                  <label
                    htmlFor="password"
                    className="mb-1 block text-[11px] font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-9 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>

                  </div>

                </div>


                {/* Confirm Password */}
                <div className="mt-2.5">

                  <label
                    htmlFor="confirmPassword"
                    className="mb-1 block text-[11px] font-medium text-slate-700"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                </div>


                {/* Terms */}
                <div className="mt-2.5 flex items-start gap-1.5">

                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="mt-0.5 h-3 w-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <label
                    htmlFor="terms"
                    className="text-[9px] leading-3.5 text-slate-500"
                  >
                    I agree to the platform's terms and conditions
                    and privacy policy.
                  </label>

                </div>


                {/* Submit */}
                <button
                  type="submit"
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Create Account
                  <ArrowRight size={13} />
                </button>

              </form>


              {/* Login Link */}
              <div className="mt-3 border-t border-slate-100 pt-3">

                <p className="text-center text-[10px] text-slate-500">

                  Already have an account?{" "}

                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Sign in
                  </Link>

                </p>

              </div>

            </div>


            {/* Security */}
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-slate-400">

              <CheckCircle2 size={10} />

              Your account information is securely handled.

            </div>

          </div>

        </div>
      </section>
    </AuthLayout>
  );
};

export default SignupPage;