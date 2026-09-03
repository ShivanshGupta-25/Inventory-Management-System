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
import { registerUser } from "../../services/authService";

const SignupPage = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("staff");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password length
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Public signup roles
    if (!["manager", "staff"].includes(selectedRole)) {
      setError(
        "Administrator accounts cannot be created through public signup."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: selectedRole,
      });

      localStorage.setItem("token", response.token);

      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      setSuccess("Account created successfully.");

      if (response.user.role === "manager") {
        navigate("/dashboard");
      } else if (response.user.role === "staff") {
        navigate("/dashboard");
      }

    } catch (error) {
      setError(
        error.message ||
        "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>

      {/* =====================================================
          FULL SIGNUP PAGE
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
                    <Package
                      size={23}
                      strokeWidth={2}
                    />
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


                {/* =================================================
                    MAIN HEADING
                ================================================== */}
                <div className="mt-7">

                  <h2 className="max-w-lg text-4xl font-bold leading-[1.12] tracking-tight text-slate-950">

                    Start managing your
                    <span className="block text-blue-600">
                      inventory smarter.
                    </span>

                  </h2>

                  <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">

                    Create your account and bring your products,
                    stock, orders, and inventory insights together
                    in one centralized platform.

                  </p>

                </div>


                {/* =================================================
                    BENEFITS
                ================================================== */}
                <div className="mt-7 space-y-4">

                  {/* Benefit 1 */}
                  <div className="flex items-center gap-3.5">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Boxes size={18} />
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
                  <div className="flex items-center gap-3.5">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <BarChart3 size={18} />
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
                  <div className="flex items-center gap-3.5">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <TrendingUp size={18} />
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


                {/* =================================================
                    TRUST MESSAGE
                ================================================== */}
                <div className="mt-7 border-t border-slate-200 pt-4">

                  <div className="flex items-center gap-2 text-xs text-slate-400">

                    <CheckCircle2
                      size={14}
                      className="text-blue-500"
                    />

                    <span>
                      Simple, centralized, and efficient inventory management.
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                RIGHT SECTION - SIGNUP
            ================================================== */}
            <div className="mx-auto w-full max-w-[410px]">

              {/* Mobile Logo */}
              <div className="mb-4 flex items-center justify-center gap-2 lg:hidden">

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
                  SIGNUP INTRO
              ================================================== */}
              <div className="text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UserPlus size={19} />
                </div>

                <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                  Create your account
                </h1>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  Set up your InventoryFlow account to get started.
                </p>

              </div>


              {/* =================================================
                  SIGNUP CARD
              ================================================== */}
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4.5 shadow-sm">

                <form onSubmit={handleSubmit}>

                  {/* =================================================
                      ROLE SELECTION
                  ================================================== */}
                  <div>

                    <div className="mb-2">

                      <h3 className="text-[11px] font-semibold text-slate-900">
                        Choose your workspace role
                      </h3>

                      <p className="mt-0.5 text-[9px] text-slate-500">
                        Select the role that matches your responsibilities.
                      </p>

                    </div>


                    <div className="grid grid-cols-3 gap-1.5">

                      {/* Administrator */}
                      <button
                        type="button"
                        disabled
                        className="relative rounded-lg border border-slate-200 p-2 text-left opacity-60"
                      >

                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                          <UserCog size={14} />
                        </div>

                        <p className="mt-1.5 text-[9px] font-bold text-slate-900">
                          Administrator
                        </p>

                        <p className="mt-0.5 text-[7px] leading-3 text-slate-500">
                          Full system access
                        </p>

                      </button>


                      {/* Manager */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole("manager")}
                        className={`relative rounded-lg border p-2 text-left transition ${
                          selectedRole === "manager"
                            ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-100"
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

                        <p className="mt-1.5 text-[9px] font-bold text-slate-900">
                          Manager
                        </p>

                        <p className="mt-0.5 text-[7px] leading-3 text-slate-500">
                          Manage operations
                        </p>

                      </button>


                      {/* Staff */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole("staff")}
                        className={`relative rounded-lg border p-2 text-left transition ${
                          selectedRole === "staff"
                            ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-100"
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

                        <p className="mt-1.5 text-[9px] font-bold text-slate-900">
                          Staff
                        </p>

                        <p className="mt-0.5 text-[7px] leading-3 text-slate-500">
                          Daily operations
                        </p>

                      </button>

                    </div>

                  </div>


                  {/* =================================================
                      FULL NAME
                  ================================================== */}
                  <div className="mt-2.5">

                    <label
                      htmlFor="name"
                      className="mb-1 block text-[10px] font-medium text-slate-700"
                    >
                      Full Name
                    </label>

                    <div className="relative">

                      <User
                        size={13}
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
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-[10px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                  </div>


                  {/* =================================================
                      EMAIL
                  ================================================== */}
                  <div className="mt-2">

                    <label
                      htmlFor="email"
                      className="mb-1 block text-[10px] font-medium text-slate-700"
                    >
                      Email Address
                    </label>

                    <div className="relative">

                      <Mail
                        size={13}
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
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-[10px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                  </div>


                  {/* =================================================
                      PASSWORD
                  ================================================== */}
                  <div className="mt-2">

                    <label
                      htmlFor="password"
                      className="mb-1 block text-[10px] font-medium text-slate-700"
                    >
                      Password
                    </label>

                    <div className="relative">

                      <Lock
                        size={13}
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
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-9 text-[10px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                          <EyeOff size={13} />
                        ) : (
                          <Eye size={13} />
                        )}
                      </button>

                    </div>

                  </div>


                  {/* =================================================
                      CONFIRM PASSWORD
                  ================================================== */}
                  <div className="mt-2">

                    <label
                      htmlFor="confirmPassword"
                      className="mb-1 block text-[10px] font-medium text-slate-700"
                    >
                      Confirm Password
                    </label>

                    <div className="relative">

                      <Lock
                        size={13}
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
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-[10px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                  </div>


                  {/* =================================================
                      ERROR
                  ================================================== */}
                  {error && (
                    <div className="mt-2.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5">

                      <p className="text-[9px] font-medium leading-3.5 text-red-600">
                        {error}
                      </p>

                    </div>
                  )}


                  {/* =================================================
                      SUCCESS
                  ================================================== */}
                  {success && (
                    <div className="mt-2.5 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5">

                      <p className="text-[9px] font-medium leading-3.5 text-green-600">
                        {success}
                      </p>

                    </div>
                  )}


                  {/* =================================================
                      TERMS
                  ================================================== */}
                  <div className="mt-2.5 flex items-start gap-1.5">

                    <input
                      id="terms"
                      type="checkbox"
                      required
                      className="mt-0.5 h-3 w-3 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />

                    <label
                      htmlFor="terms"
                      className="text-[8px] leading-3 text-slate-500"
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
                    disabled={loading}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {loading
                      ? "Creating account..."
                      : "Create Account"}

                    {!loading && (
                      <ArrowRight size={13} />
                    )}

                  </button>

                </form>


                {/* =================================================
                    LOGIN LINK
                ================================================== */}
                <div className="mt-2.5 border-t border-slate-100 pt-2.5">

                  <p className="text-center text-[9px] text-slate-500">

                    Already have an account?{" "}

                    <Link
                      to="/auth/login"
                      className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Sign in
                    </Link>

                  </p>

                </div>

              </div>


              {/* =================================================
                  SECURITY
              ================================================== */}
              <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[8px] text-slate-400">

                <CheckCircle2 size={9} />

                Your account information is securely handled.

              </div>

            </div>

          </div>

        </div>

      </section>

    </AuthLayout>
  );
};

export default SignupPage;