const Job = require("../models/Job");
const Application = require("../models/Application");
const { logAction } = require("../utils/logger");

const createJob = async (req, res, next) => {
  try {
    const { title, description, department, location, type } = req.body;
    const job = await Job.create({ title, description, department, location, type });

    await logAction(req.user._id, "CREATE_JOB", `Created job posting: ${title}`, req);

    res.status(201).json({ success: true, message: "Job created successfully", data: job });
  } catch (error) {
    next(error);
  }
};

const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    await logAction(req.user._id, "UPDATE_JOB", `Updated job posting: ${job.title}`, req);

    res.status(200).json({ success: true, message: "Job updated successfully", data: job });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    await job.deleteOne();
    await Application.deleteMany({ jobId: req.params.id });

    await logAction(req.user._id, "DELETE_JOB", `Deleted job posting: ${job.title}`, req);

    res.status(200).json({ success: true, message: "Job and its applications deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const applyToJob = async (req, res, next) => {
  try {
    const { fullName, email, resume } = req.body;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job opening not found" });
    }

    const application = await Application.create({
      jobId,
      fullName,
      email,
      resume,
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

const getApplications = async (req, res, next) => {
  try {
    const filter = req.params.jobId ? { jobId: req.params.jobId } : {};
    const applications = await Application.find(filter)
      .populate("jobId", "title department")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate("jobId");
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    application.status = status;
    await application.save();

    await logAction(req.user._id, "UPDATE_APPLICATION_STATUS", `Set application status to ${status} for ${application.fullName} (${application.jobId ? application.jobId.title : "unknown"})`, req);

    res.status(200).json({ success: true, message: `Application status updated to ${status}`, data: application });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  applyToJob,
  getApplications,
  updateApplicationStatus,
};
