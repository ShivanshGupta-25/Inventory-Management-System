import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Package,
  BarChart3,
  CheckCircle2,
  UserCog,
  Users,
  Boxes,
  TrendingUp,
} from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";

const LoginPage = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    const loginData = {
      ...formData,
      role: selectedRole,
    };

    console.log("Login:", loginData);

    // Temporary frontend-only role-based navigation
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
              LEFT SIDE - BRANDING
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

              {/* Heading */}
              <h2 className="mt-10 text-4xl font-bold leading-tight tracking-tight text-slate-950">
                Manage your inventory
                <span className="block text-blue-600">
                  smarter and faster.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
                Access your inventory workspace, monitor stock,
                manage products, and make better decisions from one
                centralized platform.
              </p>

              {/* Features */}
              <div className="mt-8 space-y-4">

                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Boxes size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Centralized Inventory
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Manage products and stock from one place.
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BarChart3 size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Inventory Analytics
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Understand your stock with useful insights.
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <TrendingUp size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Smarter Decisions
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Identify trends and optimize inventory levels.
                    </p>
                  </div>

                </div>

              </div>

              {/* Security */}
              <div className="mt-10 border-t border-slate-200 pt-6">

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2
                    size={15}
                    className="text-blue-500"
                  />

                  Your inventory workspace is securely handled.
                </div>

              </div>

            </div>
          </div>


          {/* =====================================================
              RIGHT SIDE - LOGIN
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
                <Lock size={23} />
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to access your inventory workspace.
              </p>

            </div>


            {/* =================================================
                LOGIN CARD
            ================================================== */}
            <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <form onSubmit={handleSubmit}>

                {/* =================================================
                    ROLE SELECTION
                ================================================== */}
                <div>

                  <div className="mb-3">

                    <h3 className="text-sm font-semibold text-slate-900">
                      Sign in as
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Choose your role to continue.
                    </p>

                  </div>


                  <div className="grid grid-cols-2 gap-3">

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

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <UserCog size={19} />
                      </div>

                      <p className="mt-3 text-sm font-bold text-slate-900">
                        Administrator
                      </p>

                      <p className="mt-1 text-[11px] leading-4 text-slate-500">
                        Full system access
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

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <Users size={19} />
                      </div>

                      <p className="mt-3 text-sm font-bold text-slate-900">
                        Staff
                      </p>

                      <p className="mt-1 text-[11px] leading-4 text-slate-500">
                        Operational access
                      </p>

                    </button>

                  </div>

                </div>


                {/* =================================================
                    EMAIL
                ================================================== */}
                <div className="mt-6">

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

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      Forgot password?
                    </Link>

                  </div>

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
                      placeholder="Enter your password"
                      autoComplete="current-password"
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
                    REMEMBER ME
                ================================================== */}
                <div className="mt-5 flex items-center gap-2">

                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <label
                    htmlFor="remember"
                    className="text-sm text-slate-500"
                  >
                    Remember me
                  </label>

                </div>


                {/* =================================================
                    SUBMIT
                ================================================== */}
                <button
                  type="submit"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Sign In
                  <ArrowRight size={17} />
                </button>

              </form>


              {/* =================================================
                  SIGNUP
              ================================================== */}
              <div className="mt-6 border-t border-slate-100 pt-6">

                <p className="text-center text-sm text-slate-500">
                  Don't have an account?{" "}

                  <Link
                    to="/auth/signup"
                    className="font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Create one
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

export default LoginPage;