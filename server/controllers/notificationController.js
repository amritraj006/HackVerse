const Notification = require('../models/Notification');
const teamService = require('../services/teamService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Get user notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .populate('sender', 'name email avatar')
    .populate('hackathon', 'title')
    .populate('team', 'name')
    .sort({ createdAt: -1 })
    .limit(50);

  return successResponse(res, 200, 'Notifications retrieved successfully', notifications);
});

/**
 * @desc    Accept team invitation notification
 * @route   POST /api/v1/notifications/:id/accept
 * @access  Private
 */
const acceptInvitation = asyncHandler(async (req, res) => {
  const result = await teamService.acceptInvitation(req.params.id, req.user.id);
  return successResponse(res, 200, result.message, result);
});

/**
 * @desc    Reject team invitation notification
 * @route   POST /api/v1/notifications/:id/reject
 * @access  Private
 */
const rejectInvitation = asyncHandler(async (req, res) => {
  const result = await teamService.rejectInvitation(req.params.id, req.user.id);
  return successResponse(res, 200, result.message, result);
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/v1/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, status: 'pending' }, { status: 'read' });
  return successResponse(res, 200, 'All notifications marked as read', null);
});

module.exports = {
  getNotifications,
  acceptInvitation,
  rejectInvitation,
  markAllAsRead,
};
