import { useState } from "react";
import {
  ShieldCheck,
  ShieldOff,
  Loader2,
  LockKeyhole,
} from "lucide-react";

import { updateTwoFactorSettings } from "../../services/authService";

const TwoFactorSettings = ({ user, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return null;
  }

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
              Your email address has been verified successfully.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Undefined is treated as enabled for existing accounts.
  const enabled =
    user.twoFactorEnabled !== false;

  const required =
    user.twoFactorRequired === true;

  const handleToggle = async () => {
    if (required && enabled) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response =
        await updateTwoFactorSettings({
          enabled: !enabled,
        });

      const updatedUser =
        response?.user || response?.data?.user;

      if (updatedUser && onUpdated) {
        onUpdated(updatedUser);
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to update two-factor authentication."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
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
              Add an additional security layer to your
              account using email verification codes.
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

      {required && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />

          <p>
            Two-factor authentication is required
            for this account and cannot be disabled.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default TwoFactorSettings;