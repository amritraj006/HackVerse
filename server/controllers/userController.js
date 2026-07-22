const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Get user list
 * @route   GET /api/v1/users
 * @access  Private (Admin)
 */
const getUsers = asyncHandler(async (req, res) => {
  return successResponse(res, 200, 'Users retrieved successfully (placeholder)', []);
});

/**
 * @desc    Get user profile by ID
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
const getUserProfile = asyncHandler(async (req, res) => {
  return successResponse(res, 200, 'User profile retrieved successfully (placeholder)', {
    id: req.params.id,
    name: 'Sample User',
    role: 'participant',
  });
});

module.exports = {
  getUsers,
  getUserProfile,
};
