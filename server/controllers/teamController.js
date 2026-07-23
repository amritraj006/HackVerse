const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const teamService = require('../services/teamService');

/**
 * @desc    Create a new team
 * @route   POST /api/v1/teams
 * @access  Private (Participant/Admin)
 */
const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.createTeam(req.body, req.user.id);
  return successResponse(res, 201, 'Team created successfully', team);
});

/**
 * @desc    Join team via join code
 * @route   POST /api/v1/teams/join
 * @access  Private (Participant/Admin)
 */
const joinTeamByCode = asyncHandler(async (req, res) => {
  const { joinCode } = req.body;
  const team = await teamService.joinTeamByCode(joinCode, req.user.id);
  return successResponse(res, 200, 'Successfully joined team!', team);
});

/**
 * @desc    Get user's teams
 * @route   GET /api/v1/teams/my-teams
 * @access  Private
 */
const getMyTeams = asyncHandler(async (req, res) => {
  const result = await teamService.getUserTeams(req.user.id, req.query);
  return successResponse(res, 200, 'User teams retrieved successfully', result);
});

/**
 * @desc    Get teams for a hackathon
 * @route   GET /api/v1/teams/hackathon/:hackathonId
 * @access  Private / Public
 */
const getHackathonTeams = asyncHandler(async (req, res) => {
  const result = await teamService.getHackathonTeams(req.params.hackathonId, req.query);
  return successResponse(res, 200, 'Hackathon teams retrieved successfully', result);
});


/**
 * @desc    Get team by ID
 * @route   GET /api/v1/teams/:id
 * @access  Private
 */
const getTeamById = asyncHandler(async (req, res) => {
  const team = await teamService.getTeamById(req.params.id);
  return successResponse(res, 200, 'Team details retrieved', team);
});

/**
 * @desc    Invite member by email
 * @route   POST /api/v1/teams/:id/invite
 * @access  Private (Team Leader)
 */
const inviteMember = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const team = await teamService.inviteMember(req.params.id, email, req.user.id);
  return successResponse(res, 200, 'Member added to team successfully', team);
});

/**
 * @desc    Remove member from team
 * @route   DELETE /api/v1/teams/:id/members/:memberId
 * @access  Private (Team Leader)
 */
const removeMember = asyncHandler(async (req, res) => {
  const team = await teamService.removeMember(req.params.id, req.params.memberId, req.user.id);
  return successResponse(res, 200, 'Member removed from team', team);
});

/**
 * @desc    Transfer team leadership
 * @route   PUT /api/v1/teams/:id/transfer-leadership
 * @access  Private (Team Leader)
 */
const transferLeadership = asyncHandler(async (req, res) => {
  const { newLeaderId } = req.body;
  const team = await teamService.transferLeadership(req.params.id, newLeaderId, req.user.id);
  return successResponse(res, 200, 'Leadership transferred successfully', team);
});

/**
 * @desc    Leave team
 * @route   POST /api/v1/teams/:id/leave
 * @access  Private (Team Member)
 */
const leaveTeam = asyncHandler(async (req, res) => {
  const result = await teamService.leaveTeam(req.params.id, req.user.id);
  return successResponse(res, 200, 'Left team successfully', result);
});

/**
 * @desc    Delete team
 * @route   DELETE /api/v1/teams/:id
 * @access  Private (Team Leader / Admin)
 */
const deleteTeam = asyncHandler(async (req, res) => {
  const result = await teamService.deleteTeam(req.params.id, req.user.id, req.user.role);
  return successResponse(res, 200, 'Team deleted successfully', result);
});

module.exports = {
  createTeam,
  joinTeamByCode,
  getMyTeams,
  getHackathonTeams,
  getTeamById,
  inviteMember,
  removeMember,
  transferLeadership,
  leaveTeam,
  deleteTeam,
};
