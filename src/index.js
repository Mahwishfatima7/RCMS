const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("express-async-errors");

const config = require("./config/config");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const slaScheduler = require("./utils/slaScheduler");

// Routes
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const serialRoutes = require("./routes/serialRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware - CORS first!
app.use(cors(config.cors));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options("*", cors(config.cors));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use(`${config.api.prefix}/auth`, authRoutes);
app.use(`${config.api.prefix}/complaints`, complaintRoutes);
app.use(`${config.api.prefix}/manufacturer-updates`, bookingRoutes);
app.use(`${config.api.prefix}/serials`, serialRoutes);
app.use(`${config.api.prefix}/analytics`, analyticsRoutes);
app.use(`${config.api.prefix}/users`, userRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "RCMS Backend API",
    version: "1.0.0",
    documentation: `${config.api.baseUrl}/docs`,
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
    // Start SLA scheduler
  slaScheduler.startScheduler(60000); // Update every 60 seconds (1 minute)
});

// Graceful shutdown
process.on("SIGTERM", () => {
    slaScheduler.stopScheduler();
  process.exit(0);
});

process.on("SIGINT", () => {
    slaScheduler.stopScheduler();
  process.exit(0);
});

