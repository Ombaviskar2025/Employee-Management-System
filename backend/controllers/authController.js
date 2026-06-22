/**
 * authController.js
 * Handles user login, profile retrieval, profile update, and password update.
 * Public registration is blocked.
 */

const User = require("../models/User");
const Employee = require("../models/Employee");
const generateToken = require("../utils/generateToken");

// ── @desc    Register a new user (BLOCKED)
// ── @route   POST /api/auth/register
// ── @access  Public
const register = async (req, res, next) => {
  return res.status(403).json({
    success: false,
    message: "Public registration is disabled. Accounts can only be created by Master HR.",
  });
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

    // Verify status if employee
    if (user.role === "employee") {
      const emp = await Employee.findOne({ email: user.email });
      if (emp && emp.status === "inactive") {
        return res.status(403).json({
          success: false,
          message: "Your account is deactivated. Please contact HR.",
        });
      }
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

    // Merge employee details if applicable
    let responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      token,
    };

    if (user.role === "employee") {
      const empDetails = await Employee.findOne({ email: user.email }).lean();
      if (empDetails) {
        responseData = {
          ...responseData,
          fullName: empDetails.fullName,
          mobileNumber: empDetails.mobileNumber,
          department: empDetails.department,
          designation: empDetails.designation,
          joiningDate: empDetails.joiningDate,
          profilePhoto: empDetails.profilePhoto,
          status: empDetails.status,
          salary: empDetails.salary,
          _id: empDetails._id, // Consistent ID matching
          userId: user._id,
        };
      }
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: responseData,
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
    const user = await User.findById(req.user._id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "employee") {
      const employeeDetails = await Employee.findOne({ email: user.email }).lean();
      if (employeeDetails) {
        const mergedProfile = {
          ...user,
          fullName: employeeDetails.fullName,
          mobileNumber: employeeDetails.mobileNumber,
          department: employeeDetails.department,
          designation: employeeDetails.designation,
          joiningDate: employeeDetails.joiningDate,
          profilePhoto: employeeDetails.profilePhoto,
          status: employeeDetails.status,
          salary: employeeDetails.salary,
          _id: employeeDetails._id,
          userId: user._id,
        };
        return res.status(200).json({
          success: true,
          data: mergedProfile,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Update own user profile details
// ── @route   PUT /api/auth/profile
// ── @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "employee") {
      const { fullName, mobileNumber, profilePhoto } = req.body;
      const emp = await Employee.findOne({ email: user.email });
      if (emp) {
        if (fullName) {
          emp.fullName = fullName;
          user.name = fullName;
        }
        if (mobileNumber) emp.mobileNumber = mobileNumber;
        if (profilePhoto !== undefined) emp.profilePhoto = profilePhoto;
        await emp.save();
        await user.save();
      }
    } else {
      const { name } = req.body;
      if (name) {
        user.name = name;
        await user.save();
      }
    }

    // Return updated profile details
    req.user = user;
    getProfile(req, res, next);
  } catch (error) {
    next(error);
  }
};

// ── @desc    Update password
// ── @route   PUT /api/auth/profile/password
// ── @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new passwords are required" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    user.password = newPassword;
    await user.save();

    if (user.role === "employee") {
      const emp = await Employee.findOne({ email: user.email });
      if (emp) {
        emp.password = newPassword;
        await emp.save();
      }
    }

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, updatePassword };
