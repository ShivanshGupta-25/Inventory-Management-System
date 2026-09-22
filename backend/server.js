const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const cors = require("cors");
const dotenv = require("dotenv");

// Security and logging middleware
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");

// uploads
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const stockMovementRoutes = require("./routes/stockMovementRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const salesRoutes = require("./routes/salesRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const communicationRoutes = require(
  "./routes/communicationRoutes"
);

// Socket.IO communication handling
const {
  initializeCommunicationSocket,
} = require(
  "./sockets/communicationSocket"
);

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Allowed CORS origins
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// Logging middleware
app.use(morgan("dev"));

// CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Upload middleware
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// Make Socket.IO available to controllers
app.set("io", io);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Inventory Management API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// Inventory routes
app.use("/api/inventory", inventoryRoutes);

// Stock movement routes
app.use("/api/stock-movements", stockMovementRoutes);

// Purchase order routes
app.use("/api/purchase-orders", purchaseOrderRoutes);

// Sales routes
app.use("/api/sales", salesRoutes);

// Analytics routes
app.use("/api/analytics", analyticsRoutes);

// Communication routes
app.use(
  "/api/communication",
  communicationRoutes
);

// Initialize Socket.IO communication handling
initializeCommunicationSocket(io);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});