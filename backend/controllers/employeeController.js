/**
 * employeeController.js
 * Full CRUD operations for employees.
 * Supports search, pagination, sorting and filtering via query params.
 *
 * Query params for GET /api/employees:
 *   search    - keyword search across fullName, email, designation, department
 *   page      - page number (default: 1)
 *   limit     - results per page (default: 10)
 *   sortBy    - field to sort by (default: createdAt)
 *   order     - asc | desc (default: desc)
 *   department - filter by department
 *   status    - filter by status
 */

const Employee = require("../models/Employee");
const User = require("../models/User");

// ── @desc    Get all employees (with search, pagination, sort, filter)
// ── @route   GET /api/employees
// ── @access  Private
const getEmployees = async (req, res, next) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      department,
      status,
    } = req.query;

    const cacheKey = `employees_${search}_${page}_${limit}_${sortBy}_${order}_${department || ""}_${status || ""}`;
    const cache = require("../utils/cache");
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // ── Build filter object ─────────────────────────────────────────────────
    const filter = {};

    if (search) {
      // Case-insensitive regex search across multiple fields
      const regex = new RegExp(search, "i");
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { designation: regex },
        { department: regex },
        { mobileNumber: regex },
      ];
    }

    if (department) filter.department = department;
    if (status) filter.status = status;

    // ── Pagination ──────────────────────────────────────────────────────────
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // ── Sorting ─────────────────────────────────────────────────────────────
    const allowedSortFields = [
      "fullName",
      "email",
      "department",
      "designation",
      "createdAt",
      "salary",
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj = { [sortField]: sortOrder };

    // ── Execute queries in parallel ─────────────────────────────────────────
    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Employee.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const responseData = {
      success: true,
      data: employees,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };

    cache.set(cacheKey, responseData);
    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// ── @desc    Get single employee by ID
// ── @route   GET /api/employees/:id
// ── @access  Private
const getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Create a new employee
// ── @route   POST /api/employees
// ── @access  Private
const createEmployee = async (req, res, next) => {
  try {
    const { fullName, email, mobileNumber, department, designation, salary, password, profilePhoto, status } =
      req.body;

    // Check for duplicate email in both collections
    const existingEmp = await Employee.findOne({ email });
    const existingUser = await User.findOne({ email });
    if (existingEmp || existingUser) {
      return res.status(400).json({
        success: false,
        message: "An employee with this email already exists",
      });
    }

    const employee = await Employee.create({
      fullName,
      email,
      mobileNumber,
      department,
      designation,
      salary: salary || 0,
      password: password || "HRConnectEmployee#2026!",
      profilePhoto: profilePhoto || "",
      status: status || "active",
    });

    await User.create({
      name: fullName,
      email,
      password: password || "HRConnectEmployee#2026!",
      role: "employee",
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Update an existing employee
// ── @route   PUT /api/employees/:id
// ── @access  Private
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const oldEmail = employee.email;

    // If email is being changed, check for duplicates
    if (req.body.email && req.body.email !== oldEmail) {
      const duplicateEmp = await Employee.findOne({ email: req.body.email });
      const duplicateUser = await User.findOne({ email: req.body.email });
      if (duplicateEmp || duplicateUser) {
        return res.status(400).json({
          success: false,
          message: "An employee with this email already exists",
        });
      }
    }



    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,         // Return updated document
        runValidators: true, // Run schema validators
      }
    );

    // Sync changes to User collection
    const user = await User.findOne({ email: oldEmail });
    if (user) {
      if (req.body.fullName) user.name = req.body.fullName;
      if (req.body.email) user.email = req.body.email;
      if (req.body.password) user.password = req.body.password;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Delete an employee
// ── @route   DELETE /api/employees/:id
// ── @access  Private
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const oldEmail = employee.email;
    await employee.deleteOne();
    await User.deleteOne({ email: oldEmail });

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      data: { _id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const Attendance = require("../models/Attendance");
    const Leave = require("../models/Leave");

    const [
      totalEmployees,
      activeEmployees,
      onLeave,
      presentToday,
      pendingLeaves,
      pendingRegistrations,
      departmentStats,
      recentEmployees,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: "active" }),
      Employee.countDocuments({ status: "on-leave" }),
      Attendance.countDocuments({ date: today, status: { $in: ["Present", "Late", "Half-Day"] } }),
      Leave.countDocuments({ status: "Pending" }),
      Employee.countDocuments({ status: "pending" }),
      Employee.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Employee.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullName department designation createdAt")
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        onLeave,
        presentToday,
        pendingRequests: pendingLeaves + pendingRegistrations,
        departmentStats,
        recentEmployees,
      },
    });
  } catch (error) {
    next(error);
  }
};

const approveEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    employee.status = "active";
    await employee.save();

    const User = require("../models/User");
    const { logAction } = require("../utils/logger");
    await logAction(req.user._id, "APPROVE_EMPLOYEE", `Approved registration for ${employee.email}`, req);

    res.status(200).json({
      success: true,
      message: "Employee registration approved successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

const rejectEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    employee.status = "rejected";
    await employee.save();

    const User = require("../models/User");
    await User.deleteOne({ email: employee.email });

    const { logAction } = require("../utils/logger");
    await logAction(req.user._id, "REJECT_EMPLOYEE", `Rejected registration for ${employee.email}`, req);

    res.status(200).json({
      success: true,
      message: "Employee registration rejected successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Get employees in current user's department (excluding sensitive fields)
// ── @route   GET /api/employees/my-department
// ── @access  Private (Employee or HR)
const getMyDepartmentColleagues = async (req, res, next) => {
  try {
    const currentEmployee = await Employee.findOne({ email: req.user.email });
    if (!currentEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found for current user",
      });
    }

    if (!currentEmployee.department) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const colleagues = await Employee.find({
      department: currentEmployee.department,
      status: "active",
    })
      .select("fullName designation email status profilePhoto")
      .lean();

    res.status(200).json({
      success: true,
      data: colleagues,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getStats,
  approveEmployee,
  rejectEmployee,
  getMyDepartmentColleagues,
};

