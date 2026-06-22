/**
 * errorHandler.js
 * Centralized Express error-handling middleware.
 * Converts Mongoose, JWT and custom errors into consistent JSON responses.
 */

/**
 * Global error handler — must be registered LAST in Express middleware chain.
 * Signature must have 4 params so Express recognises it as error handler.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ── Mongoose: bad ObjectId ────────────────────────────────────────────────
  if (err.name === "CastError") {
    statusCode = 404;
    message = `Resource not found with id: ${err.value}`;
  }

  // ── Mongoose: duplicate key error ─────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field '${field}'. Please use a different value.`;
  }

  // ── Mongoose: validation error ────────────────────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // ── JWT: invalid token ────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  // ── JWT: expired token ────────────────────────────────────────────────────
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }

  // ── Log error details in development ─────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    console.error("🔴 Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * notFound — 404 handler for unmatched routes.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
