import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import authService from '../services/authService.js';

/**
 * @desc    Register / Signup a new user
 * @route   POST /api/v1/auth/signup or /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return successResponse(res, 201, 'User registered successfully', result);
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return successResponse(res, 200, 'Login successful', result);
});

/**
 * @desc    Logout user / clear token
 * @route   POST /api/v1/auth/logout
 * @access  Public / Private
 */
export const logout = asyncHandler(async (req, res) => {
  return successResponse(res, 200, 'Logout successful', null);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user.id);
  return successResponse(res, 200, 'User profile retrieved successfully', { user });
});

export default {
  register,
  login,
  logout,
  getMe,
};
