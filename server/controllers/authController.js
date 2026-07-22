const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const authService = require('../services/authService');

/**
 * @desc    Register / Signup a new user
 * @route   POST /api/v1/auth/signup or /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return successResponse(res, 201, 'User registered successfully', result);
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return successResponse(res, 200, 'Login successful', result);
});

/**
 * @desc    Logout user / clear token
 * @route   POST /api/v1/auth/logout
 * @access  Public / Private
 */
const logout = asyncHandler(async (req, res) => {
  return successResponse(res, 200, 'Logout successful', null);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user.id);
  return successResponse(res, 200, 'User profile retrieved successfully', { user });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
};
