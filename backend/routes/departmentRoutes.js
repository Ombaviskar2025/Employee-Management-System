const express = require("express");
const router = express.Router();
const { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment } = require("../controllers/departmentController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getDepartments);
router.get("/:id", getDepartment);

// Admin-only routes
router.post("/", authorize("master_hr"), createDepartment);
router.put("/:id", authorize("master_hr"), updateDepartment);
router.delete("/:id", authorize("master_hr"), deleteDepartment);

module.exports = router;
