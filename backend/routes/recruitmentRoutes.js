const express = require("express");
const router = express.Router();
const { createJob, getJobs, updateJob, deleteJob, applyToJob, getApplications, updateApplicationStatus } = require("../controllers/recruitmentController");
const { protect, authorize } = require("../middleware/auth");

// Public route to view open jobs & apply
router.get("/jobs", getJobs);
router.post("/jobs/:id/apply", applyToJob);

// Protected routes
router.use(protect);

// HR only
router.post("/jobs", authorize("master_hr"), createJob);
router.put("/jobs/:id", authorize("master_hr"), updateJob);
router.delete("/jobs/:id", authorize("master_hr"), deleteJob);
router.get("/applications", authorize("master_hr"), getApplications);
router.get("/jobs/:jobId/applications", authorize("master_hr"), getApplications);
router.put("/applications/:id/status", authorize("master_hr"), updateApplicationStatus);

module.exports = router;
