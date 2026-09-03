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
  BriefcaseBusiness,
} from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("staff");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const user = response.user;

      if (user.role !== selectedRole) {
        setError(
          `This account is registered as ${user.role}. Please select the correct role.`
        );

        return;
      }

      login(response.token, user);

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "manager") {
        navigate("/manager/dashboard");
      } else if (user.role === "staff") {
        navigate("/staff/dashboard");
      }
    } catch (error) {
      setError(
        error.message || "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* =====================================================
          FULL LOGIN PAGE
      ====================================================== */}
      <section className="h-[calc(100vh-64px)] overflow-hidden bg-slate-50 px-5 sm:px-8 lg:px-10">

        {/* =====================================================
            MAIN CONTAINER
        ====================================================== */}
        <div className="mx-auto flex h-full max-w-6xl items-center">

          <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">

            {/* =================================================
                LEFT SECTION
            ================================================== */}
            <div className="hidden lg:flex lg:justify-center">

              <div className="w-full max-w-xl">

                {/* Brand */}
                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <Package size={23} strokeWidth={2} />
                  </div>

                  <div>
                    <p className="text-lg font-bold tracking-tight text-slate-950">
                      Inventory<span className="text-blue-600">Flow</span>
                    </p>

                    <p className="text-[11px] font-medium tracking-wide text-blue-600">
                      SMART INVENTORY MANAGEMENT
                    </p>
                  </div>

                </div>


                {/* Main Heading */}
                <div className="mt-7">

                  <h2 className="max-w-lg text-4xl font-bold leading-[1.12] tracking-tight text-slate-950">
                    Manage your inventory
                    <span className="block text-blue-600">
                      smarter and faster.
                    </span>
                  </h2>

                  <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">
                    Access your inventory workspace, monitor stock,
                    manage products, and make better decisions from
                    one centralized platform.
                  </p>

                </div>


                {/* =================================================
                    FEATURES
                ================================================== */}
                <div className="mt-7 space-y-4">

                  {/* Feature 1 */}
                  <div className="flex items-center gap-3.5">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Boxes size={18} />
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


                  {/* Feature 2 */}
                  <div className="flex items-center gap-3.5">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <BarChart3 size={18} />
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


                  {/* Feature 3 */}
                  <div className="flex items-center gap-3.5">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <TrendingUp size={18} />
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


                {/* =================================================
                    SECURITY MESSAGE
                ================================================== */}
                <div className="mt-7 border-t border-slate-200 pt-4">

                  <div className="flex items-center gap-2 text-xs text-slate-400">

                    <CheckCircle2
                      size={14}
                      className="text-blue-500"
                    />

                    <span>
                      Your inventory workspace is securely handled.
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                RIGHT SECTION
            ================================================== */}
            <div className="mx-auto w-full max-w-[410px]">

              {/* Mobile Logo */}
              <div className="mb-5 flex items-center justify-center gap-2 lg:hidden">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Package size={17} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-950">
                    Inventory<span className="text-blue-600">Flow</span>
                  </p>

                  <p className="text-[9px] font-medium text-blue-600">
                    SMART INVENTORY MANAGEMENT
                  </p>
                </div>

              </div>


              {/* =================================================
                  LOGIN INTRO
              ================================================== */}
              <div className="text-center">

                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Lock size={20} />
                </div>

                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h1>

                <p className="mt-1 text-xs text-slate-500">
                  Sign in to access your inventory workspace.
                </p>

              </div>


              {/* =================================================
                  LOGIN CARD
              ================================================== */}
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <form onSubmit={handleSubmit}>

                  {/* =================================================
                      ROLE SELECTION
                  ================================================== */}
                  <div>

                    <div className="mb-2.5">

                      <h3 className="text-xs font-semibold text-slate-900">
                        Choose your role
                      </h3>

                      <p className="mt-0.5 text-[10px] text-slate-500">
                        Select the role that best describes your responsibilities.
                      </p>

                    </div>


                    <div className="grid grid-cols-3 gap-2">

                      {/* Administrator */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole("admin")}
                        className={`relative rounded-xl border p-2.5 text-left transition ${
                          selectedRole === "admin"
                            ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-100"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >

                        {selectedRole === "admin" && (
                          <CheckCircle2
                            size={12}
                            className="absolute right-2 top-2 text-blue-600"
                          />
                        )}

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <UserCog size={15} />
                        </div>

                        <p className="mt-2 text-[10px] font-bold text-slate-900">
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
                        className={`relative rounded-xl border p-2.5 text-left transition ${
                          selectedRole === "manager"
                            ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-100"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >

                        {selectedRole === "manager" && (
                          <CheckCircle2
                            size={12}
                            className="absolute right-2 top-2 text-blue-600"
                          />
                        )}

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                          <BriefcaseBusiness size={15} />
                        </div>

                        <p className="mt-2 text-[10px] font-bold text-slate-900">
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
                        className={`relative rounded-xl border p-2.5 text-left transition ${
                          selectedRole === "staff"
                            ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-100"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >

                        {selectedRole === "staff" && (
                          <CheckCircle2
                            size={12}
                            className="absolute right-2 top-2 text-blue-600"
                          />
                        )}

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                          <Users size={15} />
                        </div>

                        <p className="mt-2 text-[10px] font-bold text-slate-900">
                          Staff
                        </p>

                        <p className="mt-0.5 text-[8px] leading-3 text-slate-500">
                          Daily operations
                        </p>

                      </button>

                    </div>

                  </div>


                  {/* =================================================
                      EMAIL
                  ================================================== */}
                  <div className="mt-4">

                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-medium text-slate-700"
                    >
                      Email Address
                    </label>

                    <div className="relative">

                      <Mail
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                  </div>


                  {/* =================================================
                      PASSWORD
                  ================================================== */}
                  <div className="mt-3">

                    <div className="mb-1.5 flex items-center justify-between">

                      <label
                        htmlFor="password"
                        className="text-xs font-medium text-slate-700"
                      >
                        Password
                      </label>

                      <Link
                        to="/forgot-password"
                        className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Forgot password?
                      </Link>

                    </div>

                    <div className="relative">

                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>

                    </div>

                  </div>


                  {/* =================================================
                      REMEMBER ME
                  ================================================== */}
                  <div className="mt-3 flex items-center gap-2">

                    <input
                      id="remember"
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />

                    <label
                      htmlFor="remember"
                      className="text-[10px] text-slate-500"
                    >
                      Remember me
                    </label>

                  </div>


                  {/* =================================================
                      ERROR
                  ================================================== */}
                  {error && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">

                      <p className="text-[10px] font-medium leading-4 text-red-600">
                        {error}
                      </p>

                    </div>
                  )}


                  {/* =================================================
                      SUBMIT
                  ================================================== */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >

                    {loading ? "Signing in..." : "Sign In"}

                    {!loading && <ArrowRight size={14} />}

                  </button>

                </form>


                {/* =================================================
                    SIGNUP
                ================================================== */}
                <div className="mt-4 border-t border-slate-100 pt-3.5">

                  <p className="text-center text-[10px] text-slate-500">

                    Don't have an account?{" "}

                    <Link
                      to="/auth/signup"
                      className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Create one
                    </Link>

                  </p>

                </div>

              </div>


              {/* Security */}
              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[9px] text-slate-400">

                <CheckCircle2 size={10} />

                Your account information is securely handled.

              </div>

            </div>

          </div>

        </div>

      </section>
    </AuthLayout>
  );
};

export default LoginPage;