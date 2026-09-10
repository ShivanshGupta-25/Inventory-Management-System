import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Password Input                                                             */
/* -------------------------------------------------------------------------- */
/*
 * IMPORTANT:
 * This component is intentionally OUTSIDE ChangePasswordModal.
 *
 * If it is declared inside ChangePasswordModal, React creates a new
 * component type on every render. Typing into an input then causes the
 * input to remount and lose focus.
 */

const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
  disabled,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <KeyRound
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          spellCheck={false}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Password Strength                                                          */
/* -------------------------------------------------------------------------- */

const getPasswordStrength = (password) => {
  if (!password) {
    return {
      label: "",
      width: 0,
    };
  }

  let score = 0;

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return {
      label: "Weak",
      width: 25,
    };
  }

  if (score <= 3) {
    return {
      label: "Good",
      width: 60,
    };
  }

  return {
    label: "Strong",
    width: 100,
  };
};

/* -------------------------------------------------------------------------- */
/* Change Password Modal                                                      */
/* -------------------------------------------------------------------------- */

const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  /* ---------------------------------------------------------------------- */
  /* Password Strength                                                      */
  /* ---------------------------------------------------------------------- */

  const passwordStrength =
    getPasswordStrength(newPassword);

  /* ---------------------------------------------------------------------- */
  /* Escape Key                                                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        !loading
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose, loading]);

  /* ---------------------------------------------------------------------- */
  /* Submit                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess(false);

    /* -------------------------------------------------------------------- */
    /* Validation                                                           */
    /* -------------------------------------------------------------------- */

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError(
        "Please fill in all password fields."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirmation do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    /* -------------------------------------------------------------------- */
    /* Authentication                                                       */
    /* -------------------------------------------------------------------- */

    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "Your session has expired. Please log in again."
      );
      return;
    }

    /* -------------------------------------------------------------------- */
    /* API Request                                                          */
    /* -------------------------------------------------------------------- */

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to change your password."
        );
      }

      /* ------------------------------------------------------------------ */
      /* Success                                                             */
      /* ------------------------------------------------------------------ */

      setSuccess(true);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);

      /*
       * Give the user a moment to see the success state,
       * then close the modal.
       */
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(
        "Change password error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while changing your password."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">

        {/* ================================================================ */}
        {/* Header                                                           */}
        {/* ================================================================ */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <KeyRound size={18} />
            </div>

            <div>
              <h2
                id="change-password-title"
                className="font-semibold text-slate-900"
              >
                Change Password
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Update your account password.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close change password dialog"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>

        </div>

        {/* ================================================================ */}
        {/* Form                                                             */}
        {/* ================================================================ */}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 p-6"
        >

          {/* ============================================================ */}
          {/* Success                                                        */}
          {/* ============================================================ */}

          {success && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">

              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <p className="text-sm font-medium text-emerald-700">
                  Password changed successfully.
                </p>

                <p className="mt-1 text-xs text-emerald-600">
                  Your account password has been updated.
                </p>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* Error                                                          */}
          {/* ============================================================ */}

          {error && !success && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

            </div>
          )}

          {/* ============================================================ */}
          {/* Current Password                                               */}
          {/* ============================================================ */}

          <PasswordInput
            id="currentPassword"
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showCurrent}
            onToggle={() =>
              setShowCurrent(
                (previous) => !previous
              )
            }
            autoComplete="current-password"
            disabled={loading || success}
          />

          {/* ============================================================ */}
          {/* New Password                                                   */}
          {/* ============================================================ */}

          <div className="space-y-2">

            <PasswordInput
              id="newPassword"
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              visible={showNew}
              onToggle={() =>
                setShowNew(
                  (previous) => !previous
                )
              }
              autoComplete="new-password"
              disabled={loading || success}
            />

            {/* Password Strength */}
            {newPassword && (
              <div className="space-y-2">

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Password strength
                  </span>

                  <span className="text-[11px] font-medium text-slate-500">
                    {passwordStrength.label}
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-700 transition-all duration-300"
                    style={{
                      width: `${passwordStrength.width}%`,
                    }}
                  />
                </div>

              </div>
            )}

          </div>

          {/* ============================================================ */}
          {/* Confirm Password                                               */}
          {/* ============================================================ */}

          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirm}
            onToggle={() =>
              setShowConfirm(
                (previous) => !previous
              )
            }
            autoComplete="new-password"
            disabled={loading || success}
          />

          {/* Password Match */}
          {confirmPassword && (
            <div
              className={`text-xs font-medium ${
                newPassword === confirmPassword
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {newPassword === confirmPassword
                ? "✓ Passwords match"
                : "Passwords do not match"}
            </div>
          )}

          {/* ============================================================ */}
          {/* Security Information                                           */}
          {/* ============================================================ */}

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">

            <ShieldCheck
              size={17}
              className="mt-0.5 shrink-0 text-slate-500"
            />

            <div>
              <p className="text-xs font-medium text-slate-700">
                Password security
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Use at least 6 characters. A combination
                of uppercase letters, numbers and symbols
                provides stronger protection.
              </p>
            </div>

          </div>

          {/* ============================================================ */}
          {/* Actions                                                        */}
          {/* ============================================================ */}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                success ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />

                  Updating...
                </>
              ) : (
                <>
                  <KeyRound size={15} />

                  Update Password
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;