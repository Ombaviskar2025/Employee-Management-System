const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditLogController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("master_hr"));

router.get("/", getAuditLogs);

module.exports = router;
