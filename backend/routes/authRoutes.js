/**
 * authRoutes.js
 * Routes for authentication: register, login, profile.
 */

const express = require("express");
const router = express.Router();

const { register, login, getProfile, updateProfile, updatePassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validateRegister, validateLogin } = require("../middleware/validate");

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/profile/password", protect, updatePassword);

module.exports = router;
