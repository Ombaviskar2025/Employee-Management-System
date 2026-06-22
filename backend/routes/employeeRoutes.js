/**
 * employeeRoutes.js
 * REST API routes for employee management.
 * All routes are protected — require valid JWT.
 */

const express = require("express");
const router = express.Router();

const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getStats,
} = require("../controllers/employeeController");

const { protect, authorize } = require("../middleware/auth");
const { validateEmployee } = require("../middleware/validate");

// All routes require authentication and Master HR authorization
router.use(protect);
router.use(authorize("master_hr"));

// Dashboard stats — place before :id param route to avoid conflict
router.get("/stats", getStats);

// Employee CRUD
router
  .route("/")
  .get(getEmployees)           // GET  /api/employees?search=&page=&limit=&sortBy=&order=&department=
  .post(validateEmployee, createEmployee); // POST /api/employees

router
  .route("/:id")
  .get(getEmployee)            // GET    /api/employees/:id
  .put(updateEmployee)         // PUT    /api/employees/:id
  .delete(deleteEmployee);     // DELETE /api/employees/:id

module.exports = router;
