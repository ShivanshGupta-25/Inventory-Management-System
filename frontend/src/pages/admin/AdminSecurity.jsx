import {
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getAdminProfile,
} from "../../services/adminService";

import AdminSecurityOverview from "../../components/admin/security/AdminSecurityOverview";
import AdminPasswordCard from "../../components/admin/security/AdminPasswordCard";
import AdminAccountSecurity from "../../components/admin/security/AdminAccountSecurity";
import AdminSessionCard from "../../components/admin/security/AdminSessionCard";
import AdminSecurityActivity from "../../components/admin/security/AdminSecurityActivity";
import AdminChangePasswordModal from "../../components/admin/security/AdminChangePasswordModal";
import AdminSecuritySkeleton from "../../components/admin/security/AdminSecuritySkeleton";

const AdminSecurity = () => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    changePasswordOpen,
    setChangePasswordOpen,
  ] = useState(false);

  // --------------------------------------------------
  // LOAD ADMIN
  // --------------------------------------------------

  const loadProfile = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAdminProfile();

        const profile =
          response?.user ||
          response?.data?.user ||
          response?.data ||
          response;

        setUser(profile || null);
      } catch (err) {
        console.error(
          "Failed to load admin security profile:",
          err
        );

        setError(
          err?.message ||
            "Unable to load security settings."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // --------------------------------------------------
  // PASSWORD SUCCESS
  // --------------------------------------------------

  const handlePasswordSuccess =
    () => {
      setSuccess(
        "Password changed successfully."
      );

      window.setTimeout(() => {
        setSuccess("");
      }, 3500);
    };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AdminSecuritySkeleton />
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error && !user) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <span className="text-lg font-bold">
                !
              </span>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Unable to load security settings
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadProfile}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <>
      <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* PAGE HEADER */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Account
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Security & Settings
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Protect your administrator account,
                manage authentication, and review security
                information.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={15} />
              Account protected
            </div>
          </div>

          {/* SUCCESS */}

          {success && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <CheckCircle2
                size={18}
                className="shrink-0"
              />

              <span>{success}</span>
            </div>
          )}

          {/* SECURITY OVERVIEW */}

          <AdminSecurityOverview
            user={user}
          />

          {/* MAIN CONTENT */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
            <div className="min-w-0 space-y-6">
              <AdminPasswordCard
                onChangePassword={() =>
                  setChangePasswordOpen(true)
                }
              />

              <AdminAccountSecurity
                user={user}
              />

              <AdminSecurityActivity />
            </div>

            <div className="min-w-0">
              <AdminSessionCard />
            </div>
          </div>

          {/* FOOTER */}

          <div className="border-t border-slate-200 py-5">
            <div className="flex flex-col justify-between gap-2 text-xs text-slate-400 sm:flex-row">
              <p>
                Security information is securely
                managed by InventoryFlow.
              </p>

              <p>
                Administrator Security Center
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD */}

      {changePasswordOpen && (
        <AdminChangePasswordModal
          onClose={() =>
            setChangePasswordOpen(false)
          }
          onSuccess={
            handlePasswordSuccess
          }
        />
      )}
    </>
  );
};

export default AdminSecurity;