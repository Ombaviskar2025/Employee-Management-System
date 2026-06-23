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

    // Trigger Notification for the employee
    try {
      const User = require("../models/User");
      const { triggerNotification } = require("./notificationController");
      if (leave.employeeId) {
        const employeeUser = await User.findOne({ email: leave.employeeId.email });
        if (employeeUser) {
          await triggerNotification(
            employeeUser._id,
            `Leave Request ${status}`,
            `Your request for ${leave.type} leave (${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}) has been ${status.toLowerCase()}.`,
            "leave"
          );
        }
      }
    } catch (notifError) {
      console.error("Notification trigger error:", notifError);
    }

    // If approved, deduct from Employee's leave balance and update status to 'on-leave' if active
    if (status === "Approved" && leave.employeeId) {
      try {
        const durationMs = new Date(leave.endDate) - new Date(leave.startDate);
        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;

        const emp = await Employee.findById(leave.employeeId._id);
        if (emp) {
          const typeLower = leave.type.toLowerCase();
          if (typeLower.includes("sick")) {
            emp.sickLeaves = Math.max(0, emp.sickLeaves - durationDays);
          } else if (typeLower.includes("annual") || typeLower.includes("year") || typeLower.includes("vacation")) {
            emp.annualLeaves = Math.max(0, emp.annualLeaves - durationDays);
          } else if (typeLower.includes("casual")) {
            emp.casualLeaves = Math.max(0, emp.casualLeaves - durationDays);
          }
          await emp.save();
        }

        const today = new Date();
        if (today >= leave.startDate && today <= leave.endDate) {
          await Employee.findByIdAndUpdate(leave.employeeId._id, { status: "on-leave" });
        }
      } catch (err) {
        console.error("Error updating leave balances:", err);
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
