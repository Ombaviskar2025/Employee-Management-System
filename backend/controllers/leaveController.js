const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const { logAction } = require("../utils/logger");

const applyLeave = async (req, res, next) => {
  try {
    const { type, startDate, endDate, reason } = req.body;

    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found" });
    }

    const leave = await Leave.create({
      employeeId: employee._id,
      type,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found" });
    }

    const leaves = await Leave.find({ employeeId: employee._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({})
      .populate("employeeId", "fullName email department designation")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const leave = await Leave.findById(req.params.id).populate("employeeId");
    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave record not found" });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    await leave.save();

    // If approved, update Employee status to 'on-leave' if leave is currently active
    if (status === "Approved" && leave.employeeId) {
      const today = new Date();
      if (today >= leave.startDate && today <= leave.endDate) {
        await Employee.findByIdAndUpdate(leave.employeeId._id, { status: "on-leave" });
      }
    }

    await logAction(req.user._id, "UPDATE_LEAVE_STATUS", `Set leave status to ${status} for ${leave.employeeId ? leave.employeeId.email : "unknown"}`, req);

    res.status(200).json({
      success: true,
      message: `Leave ${status.toLowerCase()} successfully`,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
};
