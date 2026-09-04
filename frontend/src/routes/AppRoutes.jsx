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

// Manager - Inventory
import InventoryPage from "../pages/manager/inventory/InventoryPage";
import StockDetailsPage from "../pages/manager/inventory/StockDetailsPage";
import StockAdjustmentPage from "../pages/manager/inventory/StockAdjustmentPage";

// Manager - Purchase Orders
import PurchaseOrderPage from "../pages/Manager/purchaseOrders/PurchaseOrderPage";
import CreatePurchaseOrderPage from "../pages/Manager/purchaseOrders/CreatePurchaseOrderPage";
import PurchaseOrderDetailsPage from "../pages/Manager/purchaseOrders/PurchaseOrderDetailsPage";
import EditPurchaseOrderPage from "../pages/Manager/purchaseOrders/EditPurchaseOrderPage";

// Manager - Sales
import SalesPage from "../pages/Manager/sales/SalesPage";
import SaleDetailsPage from "../pages/Manager/sales/SaleDetailsPage";
import CreateSalePage from "../pages/Manager/sales/CreateSalePage";


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
          element={<InventoryPage />}
        />

        <Route
          path="/manager/inventory/:id"
          element={<StockDetailsPage />}
        />

        <Route
          path="/manager/inventory/:id/adjust"
          element={<StockAdjustmentPage />}
        />

        {/* Purchase Orders */}
        <Route
          path="/manager/purchase-orders"
          element={<PurchaseOrderPage />}
        />

        <Route
          path="/manager/purchase-orders/create"
          element={<CreatePurchaseOrderPage />}
        />

        <Route
          path="/manager/purchase-orders/:id"
          element={<PurchaseOrderDetailsPage />}
        />

        <Route
          path="/manager/purchase-orders/:id/edit"
          element={<EditPurchaseOrderPage />}
        />

        {/* Sales */}
        <Route
          path="/manager/sales"
          element={<SalesPage />}
        />

        <Route
          path="/manager/sales/:id"
          element={<SaleDetailsPage />}
        />

        <Route
          path="/manager/sales/create"
          element={<CreateSalePage />}
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