const express = require("express");
const router = express.Router();
const { checkIn, checkOut, getMyAttendance, getAllAttendance, createManualAttendance } = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.post("/checkin", checkIn);
router.post("/checkout", checkOut);
router.get("/my-attendance", getMyAttendance);

// HR only
router.get("/", authorize("master_hr"), getAllAttendance);
router.post("/manual", authorize("master_hr"), createManualAttendance);

module.exports = router;
