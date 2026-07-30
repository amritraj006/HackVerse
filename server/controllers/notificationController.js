const Notification = require('../models/Notification');
const teamService = require('../services/teamService');
const hackathonService = require('../services/hackathonService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

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
 * @desc    Accept an invitation (team_invite or judge_invite)
 * @route   POST /api/v1/notifications/:id/accept
 * @access  Private
 */
const acceptInvitation = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  let result;
  if (notification.type === 'judge_invite') {
    result = await hackathonService.acceptJudgeInvite(req.params.id, req.user.id);
  } else {
    // Default: team_invite
    result = await teamService.acceptInvitation(req.params.id, req.user.id);
  }

  return successResponse(res, 200, result.message, result);
});

/**
 * @desc    Reject an invitation (team_invite or judge_invite)
 * @route   POST /api/v1/notifications/:id/reject
 * @access  Private
 */
const rejectInvitation = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  let result;
  if (notification.type === 'judge_invite') {
    result = await hackathonService.rejectJudgeInvite(req.params.id, req.user.id);
  } else {
    // Default: team_invite
    result = await teamService.rejectInvitation(req.params.id, req.user.id);
  }

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
