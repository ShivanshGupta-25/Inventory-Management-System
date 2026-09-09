const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const stockMovementRoutes = require("./routes/stockMovementRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const salesRoutes = require("./routes/salesRoutes");

dotenv.config();

connectDB();

const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Body parser
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Inventory Management API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Inventory routes
app.use("/api/inventory", inventoryRoutes);

// Stock movement routes
app.use("/api/stock-movements", stockMovementRoutes);

// Purchase order routes
app.use("/api/purchase-orders", purchaseOrderRoutes);

// Sales routes
app.use("/api/sales", salesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});