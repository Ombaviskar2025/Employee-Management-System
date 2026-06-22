/**
 * authController.js
 * Handles user registration, login and profile retrieval.
 */

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ── @desc    Register a new user
// ── @route   POST /api/auth/register
// ── @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Create user (password is hashed via pre-save hook)
    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Authenticate user & get token
// ── @route   POST /api/auth/login
// ── @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly include password for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Get current authenticated user profile
// ── @route   GET /api/auth/profile
// ── @access  Private
const getProfile = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };
