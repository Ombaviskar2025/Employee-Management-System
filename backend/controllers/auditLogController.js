const AuditLog = require("../models/AuditLog");

const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({})
      .populate("userId", "name email role")
      .sort({ timestamp: -1 });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
