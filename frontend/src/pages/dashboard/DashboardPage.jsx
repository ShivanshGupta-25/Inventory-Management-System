import { useNavigate } from "react-router-dom";
import { LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Inventory Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Your workspace
            </p>
          </div>

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name}
              </p>

              <p className="text-xs capitalize text-slate-500">
                {user?.role}
              </p>
            </div>

            <UserCircle
              size={34}
              className="text-slate-400"
            />

            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              title="Logout"
            >
              <LogOut size={19} />
            </button>

          </div>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">

        <div className="rounded-2xl border border-slate-200 bg-white p-8">

          <p className="text-sm text-slate-500">
            Currently authenticated as
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {user?.name}
          </h2>

          <div className="mt-5 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-medium capitalize text-slate-700">
            Role: {user?.role}
          </div>

          <p className="mt-6 text-slate-600">
            Dashboard modules will be implemented next.
          </p>

        </div>

      </main>

    </div>
  );
};

export default DashboardPage;