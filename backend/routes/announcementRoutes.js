const express = require("express");
const router = express.Router();
const { createAnnouncement, getAnnouncements, deleteAnnouncement } = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getAnnouncements);

// HR only
router.post("/", authorize("master_hr"), createAnnouncement);
router.delete("/:id", authorize("master_hr"), deleteAnnouncement);

module.exports = router;
