const Department = require("../models/Department");
const Employee = require("../models/Employee");
const { logAction } = require("../utils/logger");

// ── @desc    Get all departments
// ── @route   GET /api/departments
// ── @access  Private (Admin or Employee)
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({})
      .populate("head", "fullName email designation")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Get single department
// ── @route   GET /api/departments/:id
// ── @access  Private
const getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      "head",
      "fullName email designation"
    );
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }
    res.status(200).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Create department
// ── @route   POST /api/departments
// ── @access  Private (Admin only)
const createDepartment = async (req, res, next) => {
  try {
    const { name, head, description } = req.body;

    const exists = await Department.findOne({ name });
    if (exists) {
      return res.status(400).json({ success: false, message: "Department name already exists" });
    }

    const dept = await Department.create({
      name,
      head: head || undefined,
      description,
    });

    await logAction(req.user._id, "CREATE_DEPARTMENT", `Created department: ${name}`, req);

    res.status(201).json({ success: true, message: "Department created successfully", data: dept });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Update department
// ── @route   PUT /api/departments/:id
// ── @access  Private (Admin only)
const updateDepartment = async (req, res, next) => {
  try {
    const { name, head, description } = req.body;

    const dept = await Department.findById(req.params.id);
    if (!dept) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    if (name && name !== dept.name) {
      const exists = await Department.findOne({ name });
      if (exists) {
        return res.status(400).json({ success: false, message: "Department name already exists" });
      }
      dept.name = name;
    }

    dept.head = head === "" ? null : head || dept.head;
    if (description !== undefined) dept.description = description;

    await dept.save();

    await logAction(req.user._id, "UPDATE_DEPARTMENT", `Updated department: ${dept.name}`, req);

    res.status(200).json({ success: true, message: "Department updated successfully", data: dept });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Delete department
// ── @route   DELETE /api/departments/:id
// ── @access  Private (Admin only)
const deleteDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    // Check if any employees are currently assigned to this department
    const employeeCount = await Employee.countDocuments({ department: dept.name });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${employeeCount} employees currently assigned to it.`,
      });
    }

    await dept.deleteOne();

    await logAction(req.user._id, "DELETE_DEPARTMENT", `Deleted department: ${dept.name}`, req);

    res.status(200).json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
