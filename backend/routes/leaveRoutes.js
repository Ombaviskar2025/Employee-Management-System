const express = require("express");
const router = express.Router();
const { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } = require("../controllers/leaveController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.post("/", applyLeave);
router.get("/my-leaves", getMyLeaves);

// HR only
router.get("/", authorize("master_hr"), getAllLeaves);
router.put("/:id/status", authorize("master_hr"), updateLeaveStatus);

module.exports = router;
