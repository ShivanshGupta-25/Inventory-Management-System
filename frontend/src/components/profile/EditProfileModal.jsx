
import { useEffect, useState } from "react";
import {
  Loader2,
  Mail,
  User,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const EditProfileModal = ({
  user,
  onClose,
  onUpdated,
}) => {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sync form with user data
  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setError("");
    setSuccess("");
  }, [user]);

  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Validation
    if (!trimmedName || !trimmedEmail) {
      setError("Name and email are required.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Name cannot exceed 100 characters.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (trimmedEmail.length > 254) {
      setError("Email address is too long.");
      return;
    }

    // Avoid unnecessary API request
    if (
      trimmedName === (user?.name || "").trim() &&
      trimmedEmail.toLowerCase() ===
        (user?.email || "").trim().toLowerCase()
    ) {
      setError("No changes detected.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response received from the server."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update profile."
        );
      }

      const updatedUser = data.user || data.data;

      if (!updatedUser) {
        throw new Error(
          "Profile updated, but user data was not returned."
        );
      }

      // Update localStorage user data
      const existingUser =
        JSON.parse(localStorage.getItem("user") || "{}");

      const mergedUser = {
        ...existingUser,
        ...updatedUser,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(mergedUser)
      );

      setSuccess("Profile updated successfully.");

      // Notify parent component
      onUpdated(mergedUser);

    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <User
                size={19}
                className="text-slate-700"
              />
            </div>

            <div>
              <h2
                id="edit-profile-title"
                className="text-base font-semibold text-slate-900"
              >
                Edit Profile
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Update your personal information.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0"
              />

              <span>{success}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="profile-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Full Name
            </label>

            <div className="relative">

              <User
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                disabled={loading}
                required
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
              />

            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="profile-email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email Address
            </label>

            <div className="relative">

              <Mail
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Enter your email"
                autoComplete="email"
                maxLength={254}
                disabled={loading}
                required
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-500 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
              />

            </div>
          </div>

          {/* Account Information */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">

            <div className="flex items-center justify-between gap-3">

              <span className="text-xs font-medium text-slate-500">
                Account Role
              </span>

              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold capitalize text-slate-700 shadow-sm">
                {user?.role || "User"}
              </span>

            </div>

            <p className="mt-2 text-[11px] text-slate-400">
              Your account role is managed by the system administrator.
            </p>

          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {loading ? "Saving Changes..." : "Save Changes"}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default EditProfileModal;