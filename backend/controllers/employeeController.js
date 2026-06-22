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
      "joinDate",
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

    res.status(200).json({
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
    });
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
    const { fullName, email, mobileNumber, department, designation, joinDate, salary, password, profilePhoto, status } =
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

    const employee = await Employee.create({
      fullName,
      email,
      mobileNumber,
      department,
      designation,
      joinDate: parsedJoinDate,
      salary: salary || 0,
      password: password || "employee123",
      profilePhoto: profilePhoto || "",
      status: status || "active",
    });

    await User.create({
      name: fullName,
      email,
      password: password || "employee123",
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

    if (req.body.joinDate) {
      let parsedJoinDate = new Date(req.body.joinDate);
      if (isNaN(parsedJoinDate.getTime())) {
        const parts = req.body.joinDate.split(/[-/]/);
        if (parts.length === 3) {
          if (parts[2].length === 4) {
            parsedJoinDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          } else if (parts[0].length === 4) {
            parsedJoinDate = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
          }
        }
      }
      req.body.joinDate = parsedJoinDate;
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

// ── @desc    Get department stats for dashboard
// ── @route   GET /api/employees/stats
// ── @access  Private
const getStats = async (req, res, next) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      departmentStats,
      recentEmployees,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: "active" }),
      Employee.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Employee.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullName department designation joinDate")
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees: totalEmployees - activeEmployees,
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

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getStats,
  approveEmployee,
  rejectEmployee,
};
