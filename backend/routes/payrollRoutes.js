const express = require("express");
const router = express.Router();
const { getPayrollRecords, updatePayrollStatus, processAllPayroll, getMyPayroll, updatePayroll } = require("../controllers/payrollController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/my-payroll", getMyPayroll);

// HR only
router.get("/", authorize("master_hr"), getPayrollRecords);
router.put("/:id/status", authorize("master_hr"), updatePayrollStatus);
router.put("/:id", authorize("master_hr"), updatePayroll);
router.post("/process-all", authorize("master_hr"), processAllPayroll);

module.exports = router;
