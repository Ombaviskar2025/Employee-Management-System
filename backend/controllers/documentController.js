const Document = require("../models/Document");
const Employee = require("../models/Employee");
const { logAction } = require("../utils/logger");

const uploadDocument = async (req, res, next) => {
  try {
    const { name, type, url } = req.body;
    if (!name || !type || !url) {
      return res.status(400).json({ success: false, message: "Name, type and url are required" });
    }

    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found" });
    }

    const doc = await Document.create({
      employeeId: employee._id,
      name,
      type,
      url,
      status: "Pending",
    });

    res.status(201).json({ success: true, message: "Document uploaded successfully", data: doc });
  } catch (error) {
    next(error);
  }
};

const getMyDocuments = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found" });
    }

    const docs = await Document.find({ employeeId: employee._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    next(error);
  }
};

const getAllDocuments = async (req, res, next) => {
  try {
    const docs = await Document.find({})
      .populate("employeeId", "fullName email department designation")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    next(error);
  }
};

const updateDocumentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const doc = await Document.findById(req.params.id).populate("employeeId");
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    doc.status = status;
    await doc.save();

    await logAction(req.user._id, "UPDATE_DOCUMENT_STATUS", `Set document status to ${status} for ${doc.name} of ${doc.employeeId ? doc.employeeId.email : "unknown"}`, req);

    res.status(200).json({ success: true, message: `Document status updated to ${status}`, data: doc });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  getAllDocuments,
  updateDocumentStatus,
};
