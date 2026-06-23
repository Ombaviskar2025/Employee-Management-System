const Notification = require("../models/Notification");
const User = require("../models/User");

// ── @desc    Get user's notifications
// ── @route   GET /api/notifications
// ── @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // limit to last 50 notifications

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Mark notification as read
// ── @route   PUT /api/notifications/:id
// ── @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// ── @desc    Mark all notifications as read
// ── @route   PUT /api/notifications/read-all
// ── @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to trigger notifications from other controllers
const triggerNotification = async (userId, title, message, type = "general") => {
  try {
    await Notification.create({
      userId,
      title,
      message,
      type,
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  triggerNotification,
};
