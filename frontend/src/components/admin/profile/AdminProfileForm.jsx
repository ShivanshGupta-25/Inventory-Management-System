import {
  Check,
  Edit3,
  Mail,
  UserRound,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

const AdminProfileForm = ({
  user = {},
  onSave,
  saving = false,
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(user?.name || "");
  }, [user?.name]);

  const handleEdit = () => {
    setError("");
    setName(user?.name || "");
    setEditing(true);
  };

  const handleCancel = () => {
    setError("");
    setName(user?.name || "");
    setEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Full name is required.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Full name must contain at least 2 characters.");
      return;
    }

    setError("");

    try {
      await onSave({
        name: trimmedName,
      });

      setEditing(false);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update your profile. Please try again."
      );
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage the basic information associated with your administrator account.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 px-6 py-6 sm:px-8"
      >
        {/* Name */}
        <div>
          <label
            htmlFor="admin-profile-name"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Full Name
          </label>

          {editing ? (
            <div className="relative">
              <UserRound
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="admin-profile-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                disabled={saving}
                autoComplete="name"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800">
              {user?.name || "—"}
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="admin-profile-email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="admin-profile-email"
              type="email"
              value={user?.email || ""}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-600 outline-none"
            />
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Email changes will be handled through account security settings.
          </p>
        </div>

        {/* Role */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Role
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <span className="text-sm font-bold">A</span>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Administrator
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                System administrator
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        {editing && (
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={16} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check size={16} />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </section>
  );
};

export default AdminProfileForm;