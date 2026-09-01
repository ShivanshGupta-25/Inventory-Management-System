import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const {
    user,
    loading,
  } = useAuth();

  // Wait for authentication state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500">
          Loading...
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Navigate
        to="/auth/login"
        replace
      />
    );
  }

  // Check role
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {

    // Redirect to the user's own dashboard
    if (user.role === "admin") {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );
    }

    if (user.role === "manager") {
      return (
        <Navigate
          to="/manager/dashboard"
          replace
        />
      );
    }

    if (user.role === "staff") {
      return (
        <Navigate
          to="/staff/dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/auth/login"
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;