const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const authService = require('../services/authService');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return successResponse(res, 201, 'User registered successfully (placeholder)', result);
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return successResponse(res, 200, 'Login successful (placeholder)', result);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, 200, 'User profile fetched successfully (placeholder)', {
    user: req.user || { id: 'sample_id', name: 'Demo User', role: 'participant' },
  });
});

module.exports = {
  register,
  login,
  getMe,
};
