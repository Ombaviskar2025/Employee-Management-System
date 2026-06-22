const AuditLog = require("../models/AuditLog");

const logAction = async (userId, action, details, req = null) => {
  try {
    const ipAddress = req ? req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress : "system";
    await AuditLog.create({
      userId,
      action,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};

module.exports = { logAction };
