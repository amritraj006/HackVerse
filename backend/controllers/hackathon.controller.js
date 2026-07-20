const hackathonService = require('../services/hackathon.service');
const APIResponse = require('../utils/apiResponse');

const createHackathon = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.createHackathon(req.user._id, req.body);
    res.status(201).json(new APIResponse(201, { hackathon }, 'Hackathon created successfully'));
  } catch (error) {
    next(error);
  }
};

const getHackathons = async (req, res, next) => {
  try {
    const { search, theme, mode, status } = req.query;
    const hackathons = await hackathonService.getHackathons({ search, theme, mode, status });
    res.status(200).json(new APIResponse(200, { hackathons }, 'Hackathons list retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getHackathonById = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.getHackathonById(req.params.id);
    res.status(200).json(new APIResponse(200, { hackathon }, 'Hackathon details retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const updateHackathon = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.updateHackathon(req.params.id, req.user._id, req.user.role, req.body);
    res.status(200).json(new APIResponse(200, { hackathon }, 'Hackathon updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteHackathon = async (req, res, next) => {
  try {
    await hackathonService.deleteHackathon(req.params.id, req.user._id, req.user.role);
    res.status(200).json(new APIResponse(200, null, 'Hackathon deleted successfully'));
  } catch (error) {
    next(error);
  }
};

const getOrganizerHackathons = async (req, res, next) => {
  try {
    const hackathons = await hackathonService.getOrganizerHackathons(req.user._id);
    res.status(200).json(new APIResponse(200, { hackathons }, 'Organizer hackathons retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHackathon,
  getHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
  getOrganizerHackathons,
};
