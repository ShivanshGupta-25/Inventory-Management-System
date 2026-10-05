import { useEffect, useState } from "react";

import {
  Eye,
  EyeOff,
  Mail,
  Save,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";

const AdminUserForm = ({
  mode = "create",
  user = null,
  loading = false,
  onClose,
  onSubmit,
}) => {
  const isEdit = mode === "edit";

  // --------------------------------------------------
  // FORM STATE
  // --------------------------------------------------

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "staff",
  });

  // --------------------------------------------------
  // PASSWORD VISIBILITY
  // --------------------------------------------------

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // --------------------------------------------------
  // VALIDATION ERRORS
  // --------------------------------------------------

  const [errors, setErrors] = useState({});

  // --------------------------------------------------
  // INITIALIZE FORM
  // --------------------------------------------------

  useEffect(() => {
    if (isEdit && user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        role:
          user.role === "admin"
            ? "admin"
            : user.role === "manager"
            ? "manager"
            : "staff",
      });

      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);

      return;
    }

    // Reset create form
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "staff",
    });

    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [isEdit, user]);

  // --------------------------------------------------
  // UPDATE FIELD
  // --------------------------------------------------

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  // --------------------------------------------------
  // VALIDATE FORM
  // --------------------------------------------------

  const validate = () => {
    const nextErrors = {};

    // ----------------------------------------------
    // NAME
    // ----------------------------------------------

    if (!form.name.trim()) {
      nextErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      nextErrors.name =
        "Name must be at least 2 characters";
    }

    // ----------------------------------------------
    // EMAIL
    // ----------------------------------------------

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      nextErrors.email =
        "Enter a valid email address";
    }

    // ----------------------------------------------
    // CREATE-ONLY VALIDATION
    // ----------------------------------------------

    if (!isEdit) {
      // --------------------------------------------
      // ROLE
      // --------------------------------------------

      if (
        ![
          "admin",
          "manager",
          "staff",
        ].includes(form.role)
      ) {
        nextErrors.role =
          "Select a valid role";
      }

      // --------------------------------------------
      // PASSWORD
      // --------------------------------------------

      if (!form.password) {
        nextErrors.password =
          "Password is required";
      } else if (
        form.password.length < 6
      ) {
        nextErrors.password =
          "Password must be at least 6 characters";
      }

      // --------------------------------------------
      // CONFIRM PASSWORD
      // --------------------------------------------

      if (!form.confirmPassword) {
        nextErrors.confirmPassword =
          "Please confirm the password";
      } else if (
        form.password !==
        form.confirmPassword
      ) {
        nextErrors.confirmPassword =
          "Passwords do not match";
      }
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!validate()) {
      return;
    }

    // ----------------------------------------------
    // EDIT
    // ----------------------------------------------

    if (isEdit) {
      onSubmit({
        name: form.name.trim(),
        email: form.email.trim(),
      });

      return;
    }

    // ----------------------------------------------
    // CREATE
    // ----------------------------------------------

    onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    });
  };

  // --------------------------------------------------
  // INPUT CLASS
  // --------------------------------------------------

  const inputClass = (field) =>
    `h-11 w-full rounded-xl border bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 ${
      errors[field]
        ? "border-red-300 focus:border-red-400 focus:ring-red-50"
        : "border-slate-200 focus:border-slate-400 focus:ring-slate-100"
    }`;

  // --------------------------------------------------
  // ROLE LABEL
  // --------------------------------------------------

  const roleDescription = {
    admin:
      "Full administrative access to platform governance.",
    manager:
      "Can manage operational inventory and team workflows.",
    staff:
      "Can perform assigned operational staff activities.",
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              {isEdit ? (
                <ShieldCheck size={18} />
              ) : (
                <UserPlus size={18} />
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEdit
                  ? "Edit User"
                  : "Create User"}
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {isEdit
                  ? "Update the user's account information."
                  : "Create a new administrator, manager, or staff account."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-6"
        >
          {/* ==================================================
              NAME
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              placeholder="Enter full name"
              autoComplete="name"
              className={inputClass("name")}
              disabled={loading}
            />

            {errors.name && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* ==================================================
              EMAIL
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="user@example.com"
                autoComplete="email"
                className={`${inputClass(
                  "email"
                )} pl-10`}
                disabled={loading}
              />
            </div>

            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* ==================================================
              CREATE-ONLY FIELDS
          ================================================== */}

          {!isEdit && (
            <>
              {/* ==================================================
                  ROLE
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Role
                </label>

                <select
                  value={form.role}
                  onChange={(event) =>
                    updateField(
                      "role",
                      event.target.value
                    )
                  }
                  className={inputClass("role")}
                  disabled={loading}
                >
                  <option value="admin">
                    Administrator
                  </option>

                  <option value="manager">
                    Manager
                  </option>

                  <option value="staff">
                    Staff
                  </option>
                </select>

                {/* ROLE DESCRIPTION */}

                {form.role && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    {roleDescription[
                      form.role
                    ]}
                  </p>
                )}

                {errors.role && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.role}
                  </p>
                )}
              </div>

              {/* ==================================================
                  PASSWORD
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={form.password}
                    onChange={(event) =>
                      updateField(
                        "password",
                        event.target.value
                      )
                    }
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    className={`${inputClass(
                      "password"
                    )} pr-11`}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* ==================================================
                  CONFIRM PASSWORD
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      form.confirmPassword
                    }
                    onChange={(event) =>
                      updateField(
                        "confirmPassword",
                        event.target.value
                      )
                    }
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className={`${inputClass(
                      "confirmPassword"
                    )} pr-11`}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </>
          )}

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />

              {loading
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserForm;