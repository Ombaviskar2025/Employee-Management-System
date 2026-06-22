const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const { logAction } = require("../utils/logger");

const checkIn = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    // Find employee by email
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found" });
    }

    // Check if already checked in today
    const existing = await Attendance.findOne({ employeeId: employee._id, date: today });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already checked in today" });
    }

    // Check if late (e.g. after 09:15 AM)
    const checkInTime = new Date();
    const limitTime = new Date();
    limitTime.setHours(9, 15, 0, 0); // 9:15 AM
    
    const status = checkInTime > limitTime ? "Late" : "Present";

    const record = await Attendance.create({
      employeeId: employee._id,
      date: today,
      checkIn: checkInTime,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Checked in successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found" });
    }

    const record = await Attendance.findOne({ employeeId: employee._id, date: today });
    if (!record) {
      return res.status(400).json({ success: false, message: "You have not checked in today yet" });
    }

    if (record.checkOut) {
      return res.status(400).json({ success: false, message: "You have already checked out today" });
    }

    const checkOutTime = new Date();
    record.checkOut = checkOutTime;
    
    // Calculate duration in minutes
    const diffMs = checkOutTime - record.checkIn;
    record.duration = Math.round(diffMs / (1000 * 60)); // minutes
    
    // If worked less than 4 hours (240 mins), set status to Half-Day
    if (record.duration < 240) {
      record.status = "Half-Day";
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: "Checked out successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found" });
    }

    const records = await Attendance.find({ employeeId: employee._id }).sort({ date: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

const getAllAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({})
      .populate("employeeId", "fullName email department designation")
      .sort({ date: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

const createManualAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, checkIn, checkOut, status } = req.body;
    
    const record = await Attendance.findOneAndUpdate(
      { employeeId, date },
      {
        checkIn: new Date(`${date}T${checkIn || "09:00"}`),
        checkOut: checkOut ? new Date(`${date}T${checkOut}`) : undefined,
        status,
        duration: checkOut ? Math.round((new Date(`${date}T${checkOut}`) - new Date(`${date}T${checkIn || "09:00"}`)) / (1000 * 60)) : 0,
      },
      { upsert: true, new: true }
    );

    await logAction(req.user._id, "MANUAL_ATTENDANCE", `Manually logged attendance for employee ${employeeId} on ${date}`, req);

    res.status(200).json({ success: true, message: "Attendance updated successfully", data: record });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  createManualAttendance,
};
