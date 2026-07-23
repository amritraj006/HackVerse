const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const submissionService = require('../services/submissionService');

/**
 * @desc    Submit or update project
 * @route   POST /api/v1/submissions
 * @access  Private (Participant/Admin)
 */
const submitProject = asyncHandler(async (req, res) => {
  const submission = await submissionService.submitProject(req.body, req.files, req.user.id);
  return successResponse(res, 201, 'Project submitted successfully!', submission);
});

/**
 * @desc    Get user's submissions
 * @route   GET /api/v1/submissions/my-submissions
 * @access  Private
 */
const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await submissionService.getMySubmissions(req.user.id);
  return successResponse(res, 200, 'User submissions retrieved successfully', submissions);
});

/**
 * @desc    Get all public submissions (Showcase)
 * @route   GET /api/v1/submissions
 * @access  Public
 */
const getAllSubmissions = asyncHandler(async (req, res) => {
  const result = await submissionService.getAllSubmissions(req.query);
  return successResponse(res, 200, 'Submissions retrieved successfully', result);
});

/**
 * @desc    Get submissions for a hackathon
 * @route   GET /api/v1/submissions/hackathon/:hackathonId
 * @access  Private (Organizer/Judge/Admin/Participant)
 */
const getHackathonSubmissions = asyncHandler(async (req, res) => {
  const submissions = await submissionService.getHackathonSubmissions(req.params.hackathonId);
  return successResponse(res, 200, 'Hackathon submissions retrieved successfully', submissions);
});

/**
 * @desc    Get submission by ID
 * @route   GET /api/v1/submissions/:id
 * @access  Public / Private
 */
const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await submissionService.getSubmissionById(req.params.id);
  return successResponse(res, 200, 'Submission details retrieved', submission);
});

/**
 * @desc    Delete submission
 * @route   DELETE /api/v1/submissions/:id
 * @access  Private (Owner/Admin)
 */
const deleteSubmission = asyncHandler(async (req, res) => {
  const result = await submissionService.deleteSubmission(req.params.id, req.user.id, req.user.role);
  return successResponse(res, 200, 'Submission deleted successfully', result);
});

/**
 * @desc    Get submissions assigned to the logged-in judge
 * @route   GET /api/v1/submissions/assigned
 * @access  Private (Judge/Admin)
 */
const getAssignedSubmissions = asyncHandler(async (req, res) => {
  const submissions = await submissionService.getAssignedSubmissions(req.user.id, req.user.role);
  return successResponse(res, 200, 'Assigned submissions retrieved successfully', submissions);
});

/**
 * @desc    Submit one judge evaluation for a project
 * @route   POST /api/v1/submissions/:id/evaluations
 * @access  Private (Judge/Admin)
 */
const submitEvaluation = asyncHandler(async (req, res) => {
  const submission = await submissionService.submitEvaluation(req.params.id, req.body, req.user);
  return successResponse(res, 201, 'Evaluation submitted successfully', submission);
});

module.exports = {
  submitProject,
  getMySubmissions,
  getAllSubmissions,
  getHackathonSubmissions,
  getSubmissionById,
  deleteSubmission,
  getAssignedSubmissions,
  submitEvaluation,
};
