const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const { logAction } = require("../utils/logger");

const getPayrollRecords = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ success: false, message: "Month query parameter is required (e.g. 'June 2026')" });
    }

    // Ensure payroll records are created/initialized for all active employees for this month
    const employees = await Employee.find({ status: "active" });
    
    const payrolls = [];
    for (const emp of employees) {
      let record = await Payroll.findOne({ employeeId: emp._id, month });
      if (!record) {
        // Create initial record
        const basicSalary = emp.salary || 0;
        const allowances = Math.round(basicSalary * 0.10); // Default 10%
        const deductions = Math.round(basicSalary * 0.05); // Default 5%
        const netSalary = basicSalary + allowances - deductions;
        
        record = await Payroll.create({
          employeeId: emp._id,
          month,
          basicSalary,
          allowances,
          deductions,
          netSalary,
          status: "Pending",
        });
      }
      payrolls.push(record);
    }

    // Populate and send back
    const populated = await Payroll.find({ month })
      .populate("employeeId", "fullName email department designation")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updatePayrollStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["Paid", "Pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const record = await Payroll.findById(req.params.id).populate("employeeId");
    if (!record) {
      return res.status(404).json({ success: false, message: "Payroll record not found" });
    }

    record.status = status;
    await record.save();

    await logAction(req.user._id, "UPDATE_PAYROLL_STATUS", `Updated payroll status to ${status} for ${record.employeeId ? record.employeeId.email : "unknown"} (${record.month})`, req);

    res.status(200).json({ success: true, message: `Payroll status updated to ${status}`, data: record });
  } catch (error) {
    next(error);
  }
};

const processAllPayroll = async (req, res, next) => {
  try {
    const { month } = req.body;
    if (!month) {
      return res.status(400).json({ success: false, message: "Month is required" });
    }

    await Payroll.updateMany({ month }, { status: "Paid" });

    await logAction(req.user._id, "PROCESS_ALL_PAYROLL", `Processed all payroll for the month of ${month}`, req);

    res.status(200).json({ success: true, message: `All payroll for ${month} processed successfully` });
  } catch (error) {
    next(error);
  }
};

const getMyPayroll = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found" });
    }

    const records = await Payroll.find({ employeeId: employee._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayrollRecords,
  updatePayrollStatus,
  processAllPayroll,
  getMyPayroll,
};
