import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LandingPage from "../pages/landing/LandingPage";
import LoadingPage from "../pages/loading/LoadingPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import DashboardPage from "../pages/dashboard/DashboardPage";

import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      <Route path="/loading" element={<LoadingPage />} />

      <Route path="/auth/login" element={<LoginPage />} />

      <Route path="/auth/signup" element={<SignupPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
};

export default AppRoutes;
// import { Routes, Route } from "react-router-dom";
// import LandingPage from "../pages/landing/LandingPage";

// const AppRoutes = () => {
//   return (
//     <Routes>
//       <Route
//         path="/"
//         // element={
//         //   <div style={{ padding: "40px" }}>
//         //     <h1>Routes are working</h1>
//         //   </div>
//         // }
//         element={<LandingPage />}
//       />
//     </Routes>
//   );
// };

// export default AppRoutes;