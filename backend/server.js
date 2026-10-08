// --------------------------------------------------
// LOAD ENVIRONMENT VARIABLES FIRST
// --------------------------------------------------

require("dotenv").config();


// --------------------------------------------------
// CORE
// --------------------------------------------------

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");


// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

const cors = require("cors");

// Security and logging middleware
const helmet = require("helmet");
const morgan = require("morgan");


// --------------------------------------------------
// DATABASE
// --------------------------------------------------

const connectDB = require("./config/db");


// --------------------------------------------------
// SMTP
// --------------------------------------------------

const {
  verifyEmailTransport,
} = require("./services/emailService");


// --------------------------------------------------
// UPLOADS
// --------------------------------------------------

const path = require("path");


// --------------------------------------------------
// ROUTES
// --------------------------------------------------

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const stockMovementRoutes = require("./routes/stockMovementRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const salesRoutes = require("./routes/salesRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const communicationRoutes = require(
  "./routes/communicationRoutes"
);


// --------------------------------------------------
// SOCKET.IO COMMUNICATION
// --------------------------------------------------

const {
  initializeCommunicationSocket,
} = require(
  "./sockets/communicationSocket"
);


// --------------------------------------------------
// DATABASE CONNECTION
// --------------------------------------------------

connectDB();


// --------------------------------------------------
// EXPRESS APP
// --------------------------------------------------

const app = express();


// --------------------------------------------------
// HTTP SERVER
// --------------------------------------------------

const server = http.createServer(app);


// --------------------------------------------------
// CORS ORIGINS
// --------------------------------------------------

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);


// --------------------------------------------------
// SOCKET.IO
// --------------------------------------------------

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: [
      "GET",
      "POST",
      "PATCH",
      "DELETE",
    ],
    credentials: true,
  },

  transports: [
    "websocket",
    "polling",
  ],
});


// --------------------------------------------------
// SECURITY MIDDLEWARE
// --------------------------------------------------

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);


// --------------------------------------------------
// LOGGING
// --------------------------------------------------

app.use(morgan("dev"));


// --------------------------------------------------
// CORS
// --------------------------------------------------

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);


// --------------------------------------------------
// BODY PARSER
// --------------------------------------------------

app.use(express.json());


// --------------------------------------------------
// UPLOADS
// --------------------------------------------------

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);


// --------------------------------------------------
// MAKE SOCKET.IO AVAILABLE TO CONTROLLERS
// --------------------------------------------------

app.set("io", io);


// --------------------------------------------------
// ROOT ROUTE
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Inventory Management API is running",
  });
});


// --------------------------------------------------
// AUTHENTICATION ROUTES
// --------------------------------------------------

app.use(
  "/api/auth",
  authRoutes
);


// --------------------------------------------------
// ADMIN ROUTES
// --------------------------------------------------

app.use(
  "/api/admin",
  adminRoutes
);


// --------------------------------------------------
// DASHBOARD ROUTES
// --------------------------------------------------

app.use(
  "/api/dashboard",
  dashboardRoutes
);


// --------------------------------------------------
// INVENTORY ROUTES
// --------------------------------------------------

app.use(
  "/api/inventory",
  inventoryRoutes
);


// --------------------------------------------------
// STOCK MOVEMENT ROUTES
// --------------------------------------------------

app.use(
  "/api/stock-movements",
  stockMovementRoutes
);


// --------------------------------------------------
// PURCHASE ORDER ROUTES
// --------------------------------------------------

app.use(
  "/api/purchase-orders",
  purchaseOrderRoutes
);


// --------------------------------------------------
// SALES ROUTES
// --------------------------------------------------

app.use(
  "/api/sales",
  salesRoutes
);


// --------------------------------------------------
// ANALYTICS ROUTES
// --------------------------------------------------

app.use(
  "/api/analytics",
  analyticsRoutes
);


// --------------------------------------------------
// COMMUNICATION ROUTES
// --------------------------------------------------

app.use(
  "/api/communication",
  communicationRoutes
);


// --------------------------------------------------
// INITIALIZE SOCKET.IO COMMUNICATION
// --------------------------------------------------

initializeCommunicationSocket(io);


// --------------------------------------------------
// 404 HANDLER
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


// --------------------------------------------------
// SERVER
// --------------------------------------------------

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );

  verifyEmailTransport();
});