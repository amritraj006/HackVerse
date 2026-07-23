const User = require('../models/User');
const adminService = require('../services/adminService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Get user list
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
const getUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getUsers(req.query);
  return successResponse(res, 200, 'Users retrieved successfully', result);
});


/**
 * @desc    Get user profile by ID
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }
  return successResponse(res, 200, 'User profile retrieved successfully', user);
});

/**
 * @desc    Get logged in user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
const getCurrentProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return errorResponse(res, 404, 'User profile not found');
  }
  return successResponse(res, 200, 'Current profile retrieved successfully', user);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, skills } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (skills !== undefined) {
    user.skills = Array.isArray(skills)
      ? skills
      : skills.split(',').map((s) => s.trim()).filter(Boolean);
  }

  await user.save();

  return successResponse(res, 200, 'Profile updated successfully', user.toJSON());
});

/**
 * @desc    Upload profile avatar
 * @route   POST /api/v1/users/profile/avatar
 * @access  Private
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, 'Please upload an image file');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  const avatarUrl = `/uploads/${req.file.filename}`;
  user.avatar = avatarUrl;
  await user.save();

  return successResponse(res, 200, 'Avatar uploaded successfully', {
    avatar: avatarUrl,
    user: user.toJSON(),
  });
});

module.exports = {
  getUsers,
  getUserProfile,
  getCurrentProfile,
  updateProfile,
  uploadAvatar,
};
