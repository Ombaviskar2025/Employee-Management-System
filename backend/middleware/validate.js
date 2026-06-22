/**
 * validate.js
 * express-validator validation chains for auth and employee routes.
 * Each export is an array of validators + a result handler.
 */

const { body, validationResult } = require("express-validator");

// ── Helper: Run validation and return 400 on failure ─────────────────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth Validators ───────────────────────────────────────────────────────────

const validateRegister = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/\d/).withMessage("Password must contain at least one number"),

  handleValidation,
];

const validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),

  handleValidation,
];

// ── Employee Validators ───────────────────────────────────────────────────────

const validateEmployee = [
  body("fullName")
    .trim()
    .notEmpty().withMessage("Full name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("mobileNumber")
    .trim()
    .notEmpty().withMessage("Mobile number is required")
    .matches(/^[0-9]{10}$/).withMessage("Mobile number must be exactly 10 digits"),

  body("department")
    .trim()
    .notEmpty().withMessage("Department is required"),

  body("designation")
    .trim()
    .notEmpty().withMessage("Designation is required")
    .isLength({ min: 2, max: 100 }).withMessage("Designation must be 2-100 characters"),

  body("joiningDate")
    .notEmpty().withMessage("Joining date is required")
    .isISO8601().withMessage("Please enter a valid date (YYYY-MM-DD)"),

  handleValidation,
];

module.exports = { validateRegister, validateLogin, validateEmployee };
