const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const hackathonService = require('../services/hackathonService');

/**
 * @desc    Get all public hackathons
 * @route   GET /api/v1/hackathons
 * @access  Public
 */
const getHackathons = asyncHandler(async (req, res) => {
  const result = await hackathonService.getAllHackathons(req.query);
  return successResponse(res, 200, 'Hackathons retrieved successfully', result);
});

/**
 * @desc    Get single hackathon by ID
 * @route   GET /api/v1/hackathons/:id
 * @access  Public
 */
const getHackathonById = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.getHackathonById(req.params.id);
  return successResponse(res, 200, 'Hackathon details retrieved successfully', hackathon);
});

/**
 * @desc    Get events hosted by logged in organizer
 * @route   GET /api/v1/hackathons/my-events
 * @access  Private (Organizer/Admin)
 */
const getMyEvents = asyncHandler(async (req, res) => {
  const events = await hackathonService.getMyEvents(req.user.id);
  return successResponse(res, 200, 'Organizer events retrieved successfully', events);
});

/**
 * @desc    Create new hackathon
 * @route   POST /api/v1/hackathons
 * @access  Private (Organizer/Admin)
 */
const createHackathon = asyncHandler(async (req, res) => {
  const newHackathon = await hackathonService.createHackathon(req.body, req.user.id);
  return successResponse(res, 201, 'Hackathon created successfully', newHackathon);
});

/**
 * @desc    Update hackathon details
 * @route   PUT /api/v1/hackathons/:id
 * @access  Private (Organizer/Admin)
 */
const updateHackathon = asyncHandler(async (req, res) => {
  const updated = await hackathonService.updateHackathon(req.params.id, req.body, req.user);
  return successResponse(res, 200, 'Hackathon updated successfully', updated);
});

/**
 * @desc    Delete hackathon
 * @route   DELETE /api/v1/hackathons/:id
 * @access  Private (Organizer/Admin)
 */
const deleteHackathon = asyncHandler(async (req, res) => {
  const result = await hackathonService.deleteHackathon(req.params.id, req.user);
  return successResponse(res, 200, 'Hackathon deleted successfully', result);
});

/**
 * @desc    Toggle open/close registration status
 * @route   PUT /api/v1/hackathons/:id/registration
 * @access  Private (Organizer/Admin)
 */
const toggleRegistration = asyncHandler(async (req, res) => {
  const { isRegistrationOpen } = req.body;
  const updated = await hackathonService.toggleRegistrationStatus(req.params.id, isRegistrationOpen, req.user);
  const statusMsg = updated.isRegistrationOpen ? 'Registration opened' : 'Registration closed';
  return successResponse(res, 200, statusMsg, updated);
});

/**
 * @desc    Assign judges to hackathon
 * @route   PUT /api/v1/hackathons/:id/judges
 * @access  Private (Organizer/Admin)
 */
const assignJudges = asyncHandler(async (req, res) => {
  const { judgeIds } = req.body;
  const updated = await hackathonService.assignJudges(req.params.id, judgeIds || [], req.user);
  return successResponse(res, 200, 'Judges assigned successfully', updated);
});

/**
 * @desc    Publish competition results
 * @route   PUT /api/v1/hackathons/:id/results
 * @access  Private (Organizer/Admin)
 */
const publishResults = asyncHandler(async (req, res) => {
  const { winners } = req.body;
  const updated = await hackathonService.publishResults(req.params.id, winners, req.user);
  return successResponse(res, 200, 'Results published successfully', updated);
});

/**
 * @desc    Get hackathon registered teams
 * @route   GET /api/v1/hackathons/:id/teams
 * @access  Private (Organizer/Admin)
 */
const getTeams = asyncHandler(async (req, res) => {
  const teams = await hackathonService.getHackathonTeams(req.params.id);
  return successResponse(res, 200, 'Teams retrieved successfully', teams);
});

/**
 * @desc    Approve or reject team
 * @route   PUT /api/v1/hackathons/:id/teams/:teamId/status
 * @access  Private (Organizer/Admin)
 */
const updateTeamStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const updatedTeam = await hackathonService.updateTeamStatus(req.params.teamId, status, req.user);
  return successResponse(res, 200, `Team status updated to ${status}`, updatedTeam);
});

/**
 * @desc    Get hackathon submissions
 * @route   GET /api/v1/hackathons/:id/submissions
 * @access  Private (Organizer/Admin/Judge)
 */
const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await hackathonService.getHackathonSubmissions(req.params.id);
  return successResponse(res, 200, 'Submissions retrieved successfully', submissions);
});

module.exports = {
  getHackathons,
  getHackathonById,
  getMyEvents,
  createHackathon,
  updateHackathon,
  deleteHackathon,
  toggleRegistration,
  assignJudges,
  publishResults,
  getTeams,
  updateTeamStatus,
  getSubmissions,
};
