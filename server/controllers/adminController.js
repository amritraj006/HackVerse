const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const adminService = require('../services/adminService');

/**
 * @desc    Get system analytics summary
 * @route   GET /api/v1/admin/analytics
 * @access  Private (Admin)
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminService.getAnalytics();
  return successResponse(res, 200, 'Analytics retrieved successfully', analytics);
});

/**
 * @desc    Get paginated users with search & filters
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin)
 */
const getUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getUsers(req.query);
  return successResponse(res, 200, 'Users list retrieved successfully', result);
});

/**
 * @desc    Toggle user block status
 * @route   PUT /api/v1/admin/users/:id/block
 * @access  Private (Admin)
 */
const toggleBlockUser = asyncHandler(async (req, res) => {
  const { isBlocked } = req.body;
  const updatedUser = await adminService.toggleBlockUser(req.params.id, isBlocked);
  const statusMsg = updatedUser.isBlocked ? 'User has been blocked' : 'User has been unblocked';
  return successResponse(res, 200, statusMsg, updatedUser);
});

/**
 * @desc    Update user role
 * @route   PUT /api/v1/admin/users/:id/role
 * @access  Private (Admin)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const updatedUser = await adminService.updateUserRole(req.params.id, role);
  return successResponse(res, 200, `User role updated to ${role}`, updatedUser);
});

/**
 * @desc    Delete user by ID
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private (Admin)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const result = await adminService.deleteUser(req.params.id);
  return successResponse(res, 200, 'User deleted successfully', result);
});

/**
 * @desc    Get paginated hackathons
 * @route   GET /api/v1/admin/hackathons
 * @access  Private (Admin)
 */
const getHackathons = asyncHandler(async (req, res) => {
  const result = await adminService.getHackathons(req.query);
  return successResponse(res, 200, 'Hackathons retrieved successfully', result);
});

/**
 * @desc    Delete hackathon by ID
 * @route   DELETE /api/v1/admin/hackathons/:id
 * @access  Private (Admin)
 */
const deleteHackathon = asyncHandler(async (req, res) => {
  const result = await adminService.deleteHackathon(req.params.id);
  return successResponse(res, 200, 'Hackathon deleted successfully', result);
});

/**
 * @desc    Get paginated submissions
 * @route   GET /api/v1/admin/submissions
 * @access  Private (Admin)
 */
const getSubmissions = asyncHandler(async (req, res) => {
  const result = await adminService.getSubmissions(req.query);
  return successResponse(res, 200, 'Submissions retrieved successfully', result);
});

/**
 * @desc    Delete submission by ID
 * @route   DELETE /api/v1/admin/submissions/:id
 * @access  Private (Admin)
 */
const deleteSubmission = asyncHandler(async (req, res) => {
  const result = await adminService.deleteSubmission(req.params.id);
  return successResponse(res, 200, 'Submission deleted successfully', result);
});

module.exports = {
  getAnalytics,
  getUsers,
  toggleBlockUser,
  updateUserRole,
  deleteUser,
  getHackathons,
  deleteHackathon,
  getSubmissions,
  deleteSubmission,
};
