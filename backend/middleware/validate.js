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

// ── Custom Date Format Validator ──────────────────────────────────────────────
const validateDate = (value) => {
  if (!value) return false;
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  const inRegex = /^\d{2}-\d{2}-\d{4}$/;
  const slashRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  
  if (isoRegex.test(value)) {
    const d = new Date(value);
    return !isNaN(d.getTime());
  }
  if (inRegex.test(value)) {
    const [day, month, year] = value.split("-");
    const d = new Date(`${year}-${month}-${day}`);
    return !isNaN(d.getTime());
  }
  if (slashRegex.test(value)) {
    const [day, month, year] = value.split("/");
    const d = new Date(`${year}-${month}-${day}`);
    return !isNaN(d.getTime());
  }
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error("Please enter a valid date (YYYY-MM-DD or DD-MM-YYYY)");
  }
  return true;
};

// ── Auth Validators ───────────────────────────────────────────────────────────

const validateRegister = [
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
    .notEmpty().withMessage("Designation is required"),



  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

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



  body("password")
    .optional()
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  handleValidation,
];

module.exports = { validateRegister, validateLogin, validateEmployee };
