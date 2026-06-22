const Announcement = require("../models/Announcement");
const { logAction } = require("../utils/logger");

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required" });
    }

    const announcement = await Announcement.create({
      title,
      content,
      createdBy: req.user._id,
    });

    await logAction(req.user._id, "CREATE_ANNOUNCEMENT", `Created announcement: ${title}`, req);

    res.status(201).json({
      success: true,
      message: "Announcement published successfully",
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({})
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    await announcement.deleteOne();

    await logAction(req.user._id, "DELETE_ANNOUNCEMENT", `Deleted announcement: ${announcement.title}`, req);

    res.status(200).json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
};
