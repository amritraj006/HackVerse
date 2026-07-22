const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const hackathonService = require('../services/hackathonService');

/**
 * @desc    Get all hackathons
 * @route   GET /api/v1/hackathons
 * @access  Public
 */
const getHackathons = asyncHandler(async (req, res) => {
  const hackathons = await hackathonService.getAllHackathons(req.query);
  return successResponse(res, 200, 'Hackathons retrieved successfully (placeholder)', hackathons);
});

/**
 * @desc    Get single hackathon by ID
 * @route   GET /api/v1/hackathons/:id
 * @access  Public
 */
const getHackathonById = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.getHackathonById(req.params.id);
  return successResponse(res, 200, 'Hackathon details retrieved successfully (placeholder)', hackathon);
});

/**
 * @desc    Create new hackathon
 * @route   POST /api/v1/hackathons
 * @access  Private (Organizer/Admin)
 */
const createHackathon = asyncHandler(async (req, res) => {
  const newHackathon = await hackathonService.createHackathon(req.body);
  return successResponse(res, 201, 'Hackathon created successfully (placeholder)', newHackathon);
});

module.exports = {
  getHackathons,
  getHackathonById,
  createHackathon,
};
