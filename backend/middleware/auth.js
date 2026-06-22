/**
 * auth.js  (middleware)
 * Protects routes by verifying the JWT Bearer token
 * in the Authorization header.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect — Express middleware that verifies a JWT token.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // ── Extract token from Authorization: Bearer <token> ──────────────────────
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized — no token provided",
    });
  }

  try {
    // ── Verify token ──────────────────────────────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Attach user to request (excluding password) ───────────────────────────
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — user no longer exists",
      });
    }

    next();
  } catch (error) {
    // Handle specific JWT errors
    let message = "Not authorized — invalid token";
    if (error.name === "TokenExpiredError") {
      message = "Not authorized — token expired";
    }

    return res.status(401).json({ success: false, message });
  }
};

/**
 * authorize — Role-based access control middleware.
 * Usage: authorize('admin')
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not permitted to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
