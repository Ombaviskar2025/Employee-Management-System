/**
 * server.js
 * Express application entry point.
 * Connects to MongoDB, registers middleware and routes,
 * then starts the HTTP server.
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const recruitmentRoutes = require("./routes/recruitmentRoutes");
const documentRoutes = require("./routes/documentRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

const app = express();

// Secure Express headers
app.use(helmet());

// Compress API responses
app.use(compression());

// Parse cookies (needed for HTTP-only refresh tokens)
app.use(cookieParser());

// Rate limit login route (max 5 requests per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", loginLimiter);

// ── Global Middleware ─────────────────────────────────────────────────────────

// CORS — allow requests only from the configured frontend origin
// Allow all Vercel preview URLs + configured FRONTEND_URL
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow any .vercel.app subdomain in production, or if allowedOrigins contains "*"
      if (
        origin.endsWith(".vercel.app") ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes("*")
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON bodies (up to 10 MB)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EMS API is running 🚀",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/notifications", notificationRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use(notFound);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server (skip on Vercel — serverless handles this) ──────────────────
if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });

  // ── Graceful Shutdown ───────────────────────────────────────────────────────
  process.on("unhandledRejection", (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(() => process.exit(0));
  });
}

module.exports = app; // Export for testing
