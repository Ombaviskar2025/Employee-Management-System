/**
 * Employee.js
 * Mongoose schema & model for employees.
 * Includes all required HR fields with validation.
 */

const mongoose = require("mongoose");

const DEPARTMENTS = [
  "Engineering",
  "IT",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Legal",
  "Design",
  "Product",
  "Customer Support",
  "Management",
  "Other",
];

const employeeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: {
        values: DEPARTMENTS,
        message: "Invalid department: {VALUE}",
      },
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
      minlength: [2, "Designation must be at least 2 characters"],
      maxlength: [100, "Designation cannot exceed 100 characters"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on-leave"],
      default: "active",
    },
    salary: {
      type: Number,
      min: [0, "Salary cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// ── Text Index for full-text search ──────────────────────────────────────────
employeeSchema.index({
  fullName: "text",
  email: "text",
  designation: "text",
  department: "text",
});

// ── Virtual: Years of service ─────────────────────────────────────────────────
employeeSchema.virtual("yearsOfService").get(function () {
  const now = new Date();
  const joining = new Date(this.joiningDate);
  const diff = now - joining;
  return (diff / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
});

// Ensure virtuals appear in JSON
employeeSchema.set("toJSON", { virtuals: true });
employeeSchema.set("toObject", { virtuals: true });

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
module.exports.DEPARTMENTS = DEPARTMENTS;
