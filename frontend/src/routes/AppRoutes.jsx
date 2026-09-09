import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LandingPage from "../pages/landing/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";

import ContactPage from "../pages/contact/ContactPage";
import PricingPage from "../pages/pricing/PricingPage";

// Authentication
import ProtectedRoute from "./ProtectedRoute";

// Dashboard
import DashboardPage from "../pages/dashboard/DashboardPage";
import ManagerDashboardPage from "../pages/Manager/ManagerDashboardPage";

// Inventory
import Inventory from "../pages/Manager/inventory/Inventory";
import InventoryDetails from "../pages/Manager/inventory/InventoryDetails";

// Purchase Orders
import PurchaseOrders from "../pages/Manager/purchaseOrders/PurchaseOrders";
import PurchaseOrderDetails from "../pages/Manager/purchaseOrders/PurchaseOrderDetails";

// Sales
import Sales from "../pages/Manager/Sales/Sales";
import CreateSale from "../pages/Manager/Sales/CreateSale";
import SaleDetails from "../pages/Manager/Sales/SaleDetails";
import EditSale from "../pages/Manager/Sales/EditSale";


const AppRoutes = () => {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/contact"
        element={<ContactPage />}
      />

      <Route
        path="/pricing"
        element={<PricingPage />}
      />

      <Route
        path="/auth/login"
        element={<LoginPage />}
      />

      <Route
        path="/auth/signup"
        element={<SignupPage />}
      />


      {/* =====================================================
          PROTECTED ROUTES
      ====================================================== */}

      {/* ==================== ADMIN ==================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]} />
        }
      >
        <Route
          path="/admin/dashboard"
          element={<DashboardPage />}
        />
      </Route>


      {/* ==================== MANAGER ==================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["manager"]} />
        }
      >

        {/* Manager Dashboard */}
        <Route
          path="/manager/dashboard"
          element={<ManagerDashboardPage />}
        />

        {/* Inventory */}
        <Route
          path="/manager/inventory"
          element={<Inventory />}
        />

        <Route
          path="/manager/inventory/:id"
          element={<InventoryDetails />}
        />

        {/* Purchase Orders */}
        <Route
          path="/manager/purchase-orders"
          element={<PurchaseOrders />}
        />

        <Route
          path="/manager/purchase-orders/:id"
          element={<PurchaseOrderDetails />}
        />

        {/* Sales */}
        <Route
          path="/manager/sales"
          element={<Sales />}
        />

        <Route
          path="/manager/sales/create"
          element={<CreateSale />}
        />

        <Route
          path="/manager/sales/:id"
          element={<SaleDetails />}
        />

        <Route
          path="/manager/sales/:id/edit"
          element={<EditSale />}
        />

      </Route>


      {/* ==================== STAFF ==================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["staff"]} />
        }
      >
        <Route
          path="/staff/dashboard"
          element={<DashboardPage />}
        />
      </Route>


      {/* =====================================================
          FALLBACK
      ====================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
};

export default AppRoutes;