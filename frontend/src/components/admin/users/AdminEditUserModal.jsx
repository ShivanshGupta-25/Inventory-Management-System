import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  Shield,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

const AdminEditUserModal = ({
  user,
  open,
  onClose,
  onSave,
  saving = false,
}) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "staff",
  });

  const [error, setError] = useState("");

  /*
   * Admin accounts are system-level accounts.
   * Their role cannot be changed from this interface.
   */
  const isAdminAccount =
    String(user?.role || "").toLowerCase() === "admin";

  useEffect(() => {
    if (!user || !open) {
      return;
    }

    setForm({
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "staff",
    });

    setError("");
  }, [user, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, saving, onClose]);

  if (!open || !user) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    /*
     * Extra protection:
     * even if something attempts to change the role field
     * programmatically, an admin account remains admin.
     */
    if (name === "role" && isAdminAccount) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name) {
      setError("Name is required.");
      return;
    }

    if (name.length < 2) {
      setError(
        "Name must contain at least 2 characters."
      );
      return;
    }

    if (!email) {
      setError("Email address is required.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    /*
     * Never send a role change for an administrator.
     */
    const payload = {
      name,
      email,
    };

    if (!isAdminAccount) {
      if (!form.role) {
        setError("Please select a role.");
        return;
      }

      payload.role = form.role;
    }

    try {
      setError("");

      await onSave(payload);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update the user. Please try again."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <UserRound size={18} />
            </div>

            <div>
              <h2
                id="edit-user-title"
                className="text-base font-bold text-slate-900"
              >
                Edit User
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Update this user's account information.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* =====================================================
            FORM
        ===================================================== */}

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-5 sm:p-6">

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <p className="text-xs leading-5 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* =================================================
                ADMIN ACCOUNT NOTICE
            ================================================= */}

            {isAdminAccount && (
              <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-3">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-violet-600"
                />

                <div>
                  <p className="text-xs font-semibold text-violet-800">
                    Administrator Account
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-violet-700">
                    Administrator accounts are protected
                    system accounts. Their role cannot be
                    changed and their account cannot be
                    disabled.
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                NAME
            ================================================= */}

            <div>
              <label
                htmlFor="edit-user-name"
                className="mb-2 block text-xs font-semibold text-slate-700"
              >
                Full Name
              </label>

              <div className="relative">
                <UserRound
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="edit-user-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div>
              <label
                htmlFor="edit-user-email"
                className="mb-2 block text-xs font-semibold text-slate-700"
              >
                Email Address
              </label>

              <input
                id="edit-user-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={saving}
                placeholder="user@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {/* =================================================
                ROLE
            ================================================= */}

            <div>
              <label
                htmlFor="edit-user-role"
                className="mb-2 block text-xs font-semibold text-slate-700"
              >
                Role
              </label>

              <div className="relative">
                <Shield
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  id="edit-user-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  disabled={saving || isAdminAccount}
                  className={`w-full appearance-none rounded-xl border py-2.5 pl-10 pr-3 text-sm font-medium outline-none transition ${
                    isAdminAccount
                      ? "cursor-not-allowed border-violet-100 bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-white text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  }`}
                >
                  <option value="staff">
                    Staff
                  </option>

                  <option value="manager">
                    Manager
                  </option>

                  <option value="admin">
                    Administrator
                  </option>
                </select>
              </div>

              {isAdminAccount ? (
                <p className="mt-2 flex items-center gap-1.5 text-[10px] leading-4 text-violet-600">
                  <ShieldCheck size={12} />
                  Administrator role is protected and cannot
                  be changed.
                </p>
              ) : (
                <p className="mt-2 text-[10px] leading-4 text-slate-400">
                  Changing a role changes the permissions
                  available to this user.
                </p>
              )}
            </div>

            {/* =================================================
                ACCOUNT STATUS
            ================================================= */}

            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0 text-slate-500"
              />

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Account Status
                </p>

                <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                  Account activation and disabling are managed
                  separately from profile information.
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditUserModal;