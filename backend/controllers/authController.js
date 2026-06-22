/**
 * authController.js
 * Handles user login, registration, profile retrieval, profile update, and password update.
 */

const crypto = require("crypto");
const User = require("../models/User");
const Employee = require("../models/Employee");
const generateToken = require("../utils/generateToken");

// ── @desc    Register a new employee
// ── @route   POST /api/auth/register
// ── @access  Public
const register = async (req, res, next) => {
  try {
    const { fullName, email, mobileNumber, department, designation, joinDate, password } = req.body;

    // Check duplicate email
    const existingEmp = await Employee.findOne({ email });
    const existingUser = await User.findOne({ email });
    if (existingEmp || existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Parse join date safely
    let parsedJoinDate = new Date(joinDate);
    if (isNaN(parsedJoinDate.getTime())) {
      const parts = joinDate.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[2].length === 4) {
          parsedJoinDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else if (parts[0].length === 4) {
          parsedJoinDate = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
        }
      }
    }

    // Create Employee in 'pending' status
    const employee = await Employee.create({
      fullName,
      email,
      mobileNumber,
      department,
      designation,
      joinDate: parsedJoinDate,
      password,
      status: "pending",
    });

    // Create User in 'employee' role
    await User.create({
      name: fullName,
      email,
      password,
      role: "employee",
    });

    res.status(201).json({
      success: true,
      message: "Registration successful! Your account is pending approval from Master HR.",
      data: {
        fullName: employee.fullName,
        email: employee.email,
        status: employee.status,
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

    // Verify status if employee
    if (user.role === "employee") {
      const emp = await Employee.findOne({ email: user.email });
      if (!emp) {
        return res.status(404).json({
          success: false,
          message: "Employee profile not found",
        });
      }
      if (emp.status === "pending") {
        return res.status(403).json({
          success: false,
          message: "Your account is pending approval from Master HR.",
        });
      }
      if (emp.status === "rejected") {
        return res.status(403).json({
          success: false,
          message: "Your registration has been rejected. Please contact HR.",
        });
      }
      if (emp.status === "inactive") {
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
          joinDate: empDetails.joinDate,
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
          joinDate: employeeDetails.joinDate,
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

// ── @desc    Forgot Password
// ── @route   POST /api/auth/forgot-password
// ── @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide an email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with that email" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Since we don't have mailer, we log it and return it in the response for convenience
    console.log(`🔑 Reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: "Reset token generated successfully. (Check backend console / returned token in response)",
      resetToken, // Returning for demo/testing convenience
    });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Reset Password
// ── @route   POST /api/auth/reset-password/:token
// ── @access  Public
const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Sync to Employee collection
    if (user.role === "employee") {
      const emp = await Employee.findOne({ email: user.email });
      if (emp) {
        emp.password = req.body.password;
        await emp.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Password reset successful! You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, updatePassword, forgotPassword, resetPassword };
