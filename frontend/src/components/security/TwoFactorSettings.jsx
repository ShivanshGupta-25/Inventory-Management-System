import { useState } from "react";

import {
  ShieldCheck,
  ShieldOff,
  Loader2,
  LockKeyhole,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import { updateTwoFactorSettings } from "../../services/authService";

const TwoFactorSettings = ({
  user,
  onUpdated,
}) => {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    showPasswordModal,
    setShowPasswordModal,
  ] = useState(false);

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    targetState,
    setTargetState,
  ] = useState(false);

  // --------------------------------------------------
  // USER CHECK
  // --------------------------------------------------

  if (!user) {
    return null;
  }

  // --------------------------------------------------
  // ROLE CHECK
  // --------------------------------------------------

  const isAdminOrManager =
    user.role === "admin" ||
    user.role === "manager";

  // Staff should not get a 2FA control.
  if (!isAdminOrManager) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
            <ShieldCheck className="h-5 w-5 text-green-600" />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Email Verified
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              Your email address has been
              verified successfully.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // CURRENT 2FA STATE
  // --------------------------------------------------

  // Undefined is treated as enabled for
  // existing accounts.
  const enabled =
    user.twoFactorEnabled !== false;

  const required =
    user.twoFactorRequired === true;

  // --------------------------------------------------
  // OPEN PASSWORD MODAL
  // --------------------------------------------------

  const handleToggle = () => {
    // Required 2FA cannot be changed.
    if (required) {
      return;
    }

    const newValue = !enabled;

    setTargetState(newValue);

    setCurrentPassword("");

    setShowPassword(false);

    setError("");

    setShowPasswordModal(true);
  };

  // --------------------------------------------------
  // CLOSE PASSWORD MODAL
  // --------------------------------------------------

  const handleCloseModal = () => {
    if (loading) {
      return;
    }

    setShowPasswordModal(false);

    setCurrentPassword("");

    setShowPassword(false);

    setError("");
  };

  // --------------------------------------------------
  // UPDATE TWO FACTOR
  // --------------------------------------------------

  const updateTwoFactor = async () => {
    if (!currentPassword.trim()) {
      setError(
        "Please enter your current password."
      );

      return;
    }

    setError("");

    setLoading(true);

    try {
      const response =
        await updateTwoFactorSettings({
          enabled: targetState,
          currentPassword:
            currentPassword.trim(),
        });

      const updatedUser =
        response?.user ||
        response?.data?.user;

      if (updatedUser && onUpdated) {
        onUpdated(updatedUser);
      }

      // Close modal
      setShowPasswordModal(false);

      // Clear sensitive state
      setCurrentPassword("");

      setShowPassword(false);

      setError("");
    } catch (err) {
      console.error(
        "Two-factor authentication update error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update two-factor authentication."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // PASSWORD KEYBOARD HANDLER
  // --------------------------------------------------

  const handlePasswordKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !loading
    ) {
      event.preventDefault();

      updateTwoFactor();
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <>
      {/* ==================================================
          TWO FACTOR CARD
      ================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">

          {/* LEFT */}

          <div className="flex items-start gap-3">

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                enabled
                  ? "bg-green-100"
                  : "bg-gray-100"
              }`}
            >
              {enabled ? (
                <ShieldCheck className="h-5 w-5 text-green-600" />
              ) : (
                <ShieldOff className="h-5 w-5 text-gray-500" />
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Two-Factor Authentication
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                Add an additional security layer
                to your account using email
                verification codes.
              </p>

              <div className="mt-3 flex items-center gap-2">

                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    enabled
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {enabled
                    ? "Enabled"
                    : "Disabled"}
                </span>

                <span className="text-xs text-gray-500">
                  Method: Email
                </span>

              </div>
            </div>
          </div>

          {/* TOGGLE */}

          <button
            type="button"
            onClick={handleToggle}
            disabled={loading || required}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              enabled
                ? "bg-green-600"
                : "bg-gray-300"
            } ${
              loading || required
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
            aria-label={
              enabled
                ? "Disable two-factor authentication"
                : "Enable two-factor authentication"
            }
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                enabled
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />

            {loading && (
              <Loader2 className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-spin text-gray-600" />
            )}
          </button>
        </div>

        {/* REQUIRED MESSAGE */}

        {required && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />

            <p>
              Two-factor authentication is
              required for this account and
              cannot be disabled.
            </p>
          </div>
        )}

        {/* CARD ERROR */}

        {error && !showPasswordModal && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* ==================================================
          PASSWORD VERIFICATION MODAL
      ================================================== */}

      {showPasswordModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onMouseDown={handleCloseModal}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    targetState
                      ? "bg-blue-100"
                      : "bg-amber-100"
                  }`}
                >
                  {targetState ? (
                    <LockKeyhole className="h-5 w-5 text-blue-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {targetState
                      ? "Enable Two-Factor Authentication"
                      : "Disable Two-Factor Authentication"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Password verification required
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* ==========================================
                BODY
            ========================================== */}

            <div className="px-6 py-5">

              <p className="text-sm leading-6 text-gray-600">
                {targetState
                  ? "To enable two-factor authentication, please verify your current account password."
                  : "To disable two-factor authentication, please verify your current account password."}
              </p>

              {/* DISABLE WARNING */}

              {!targetState && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">

                    <ShieldOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        This will reduce your account security.
                      </p>

                      <p className="mt-1 text-sm leading-5 text-amber-700">
                        After disabling 2FA,
                        you will no longer be
                        asked for an email
                        verification code when
                        signing in.
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* ENABLE INFORMATION */}

              {targetState && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">

                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Your account security will be increased.
                      </p>

                      <p className="mt-1 text-sm leading-5 text-blue-700">
                        After enabling 2FA,
                        you will be asked for
                        an email verification
                        code when signing in.
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* PASSWORD */}

              <div className="mt-5">

                <label
                  htmlFor="two-factor-current-password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Current Password
                </label>

                <div className="relative">

                  <input
                    id="two-factor-current-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(event) => {
                      setCurrentPassword(
                        event.target.value
                      );

                      if (error) {
                        setError("");
                      }
                    }}
                    onKeyDown={
                      handlePasswordKeyDown
                    }
                    disabled={loading}
                    autoFocus
                    autoComplete="current-password"
                    placeholder="Enter your current password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />

                  {/* EYE BUTTON */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
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

              {/* ERROR */}

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

            </div>

            {/* ==========================================
                FOOTER
            ========================================== */}

            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={updateTwoFactor}
                disabled={
                  loading ||
                  !currentPassword.trim()
                }
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  targetState
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >

                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {loading
                  ? targetState
                    ? "Enabling..."
                    : "Disabling..."
                  : targetState
                    ? "Verify & Enable"
                    : "Verify & Disable"}

              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default TwoFactorSettings;