import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  changeAdminPassword,
} from "../../../services/adminService";

const AdminChangePasswordModal = ({
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
    useState("");

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
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
  }, [loading, onClose]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const validate = () => {
    if (!form.currentPassword) {
      return "Enter your current password.";
    }

    if (!form.newPassword) {
      return "Enter a new password.";
    }

    if (form.newPassword.length < 8) {
      return "New password must be at least 8 characters.";
    }

    if (!/[A-Z]/.test(form.newPassword)) {
      return "New password must contain an uppercase letter.";
    }

    if (!/[a-z]/.test(form.newPassword)) {
      return "New password must contain a lowercase letter.";
    }

    if (!/[0-9]/.test(form.newPassword)) {
      return "New password must contain a number.";
    }

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await changeAdminPassword({
        currentPassword:
          form.currentPassword,
        newPassword:
          form.newPassword,
      });

      setSuccess(
        "Your password has been changed successfully."
      );

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      window.setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to change your password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}

        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
              <KeyRound size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Change Password
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update the password used to access your administrator account.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-6 py-6"
        >
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0"
              />

              <span>{success}</span>
            </div>
          )}

          <PasswordField
            label="Current Password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            visible={showCurrent}
            onToggle={() =>
              setShowCurrent(
                (value) => !value
              )
            }
            disabled={loading}
          />

          <PasswordField
            label="New Password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            visible={showNew}
            onToggle={() =>
              setShowNew(
                (value) => !value
              )
            }
            disabled={loading}
          />

          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            visible={showConfirm}
            onToggle={() =>
              setShowConfirm(
                (value) => !value
              )
            }
            disabled={loading}
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-700">
              Password requirements
            </p>

            <ul className="mt-2 space-y-1.5 text-xs text-slate-500">
              <li>• At least 8 characters</li>
              <li>• At least one uppercase letter</li>
              <li>• At least one lowercase letter</li>
              <li>• At least one number</li>
            </ul>
          </div>

          {/* Actions */}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Updating...
                </>
              ) : (
                <>
                  <KeyRound size={16} />
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

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  disabled,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-800"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete="new-password"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
          placeholder={`Enter ${label.toLowerCase()}`}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={onToggle}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminChangePasswordModal;