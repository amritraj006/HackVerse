const teamService = require('../services/team.service');
const APIResponse = require('../utils/apiResponse');

const createTeam = async (req, res, next) => {
  try {
    const team = await teamService.createTeam(req.user._id, req.body);
    res.status(201).json(new APIResponse(201, { team }, 'Team created successfully'));
  } catch (error) {
    next(error);
  }
};

const joinTeam = async (req, res, next) => {
  try {
    const team = await teamService.joinTeam(req.user._id, req.body);
    res.status(200).json(new APIResponse(200, { team }, 'Joined team successfully'));
  } catch (error) {
    next(error);
  }
};

const getTeamDetails = async (req, res, next) => {
  try {
    const team = await teamService.getTeamDetails(req.params.id);
    res.status(200).json(new APIResponse(200, { team }, 'Team details retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getMyTeamForHackathon = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;
    const team = await teamService.getMyTeamForHackathon(req.user._id, hackathonId);
    res.status(200).json(new APIResponse(200, { team }, 'My team for hackathon retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const leaveTeam = async (req, res, next) => {
  try {
    const result = await teamService.leaveTeam(req.params.id, req.user._id);
    const message = result.disbanded ? 'Team disbanded successfully' : 'Left team successfully';
    res.status(200).json(new APIResponse(200, result, message));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeam,
  joinTeam,
  getTeamDetails,
  getMyTeamForHackathon,
  leaveTeam,
};
