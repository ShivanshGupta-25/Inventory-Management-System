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

// Staff
import StaffDashboardPage from "../pages/Staff/StaffDashboardPage";
import StaffAlertsPage from "../components/staff/dashboard/StaffAlertsPage";
import StaffStockHistoryPage from "../components/staff/dashboard/StaffStockHistoryPage";

// Staff Inventory
import StaffInventory from "../pages/Staff/Inventory/Inventory";
import StaffInventoryDetails from "../pages/Staff/Inventory/InventoryDetails";

// Staff Stock Operations
import StockOperationsPage from "../pages/Staff/StockOperationsPage";

// Staff Purchase Requests
import PurchaseRequests from "../pages/Staff/PurchaseRequests/PurchaseRequests";
import CreatePurchaseRequest from "../pages/Staff/PurchaseRequests/CreatePurchaseRequest";
import PurchaseRequestDetails from "../pages/Staff/PurchaseRequests/PurchaseRequestDetails";

// Staff Sales
import StaffSales from "../pages/Staff/Sales/StaffSales";
import StaffCreateSale from "../pages/Staff/Sales/StaffCreateSale";
import StaffSaleDetails from "../pages/Staff/Sales/StaffSaleDetails";
import StaffEditSale from "../pages/Staff/Sales/StaffEditSale";

// Staff Returns
import Returns from "../pages/Staff/Returns/Returns";
import ProcessReturn from "../pages/Staff/Returns/ProcessReturn";
import ReturnDetails from "../pages/Staff/Returns/ReturnDetails";

// Manager
import ManagerDashboardPage from "../pages/Manager/ManagerDashboardPage";
import Profile from "../pages/Manager/Profile";
import Settings from "../pages/Manager/Settings";

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

// Analytics
import Analytics from "../pages/Manager/Analytics/Analytics";


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

      {/* <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]} />
        }
      >
        <Route
          path="/admin/dashboard"
          element={<DashboardPage />}
        />
      </Route> */}


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

        {/* Profile */}
        <Route
          path="/manager/profile"
          element={<Profile />}
        />

        {/* Settings */}
        <Route
          path="/manager/settings"
          element={<Settings />}
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

        {/* Analytics */}
        <Route
          path="/manager/analytics"
          element={<Analytics />}
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
          element={<StaffDashboardPage />}
        />

        <Route
          path="/staff/inventory"
          element={<StaffInventory />}  
        />

        <Route path="/staff/inventory/:id" element={<StaffInventoryDetails />} />

        <Route
          path="/staff/alerts"
          element={<StaffAlertsPage />}
        />

        {/* Staff Stock History */}
        <Route
          path="/staff/stock-history"
          element={<StaffStockHistoryPage />}
        />

        <Route
          path="/staff/stock-operations"
          element={<StockOperationsPage />}
        />

        {/* Staff Purchase Requests */}
        <Route
          path="/staff/purchase-requests"
          element={<PurchaseRequests />}
        />

        <Route
          path="/staff/purchase-requests/create"
          element={<CreatePurchaseRequest />}
        />

        <Route
          path="/staff/purchase-requests/:id"
          element={<PurchaseRequestDetails />}
        />

        <Route
          path="/staff/purchase-requests/:id/edit"
          element={<CreatePurchaseRequest />}
        />


        {/* Staff Sales */}
        <Route
          path="/staff/sales"
          element={<StaffSales />}
        />

        <Route
          path="/staff/sales/create"
          element={<StaffCreateSale />}
        />

        <Route
          path="/staff/sales/:id"
          element={<StaffSaleDetails />}
        />

        <Route
          path="/staff/sales/:id/edit"
          element={<StaffEditSale />}  
        />

        {/* Staff Returns */}
        <Route
          path="/staff/returns"
          element={<Returns />}
        />

        <Route
          path="/staff/returns/process"
          element={<ProcessReturn />}
        />

        <Route
          path="/staff/returns/:id"
          element={<ReturnDetails />}
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