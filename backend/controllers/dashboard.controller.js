const dashboardService = require('../services/dashboard.service');
const APIResponse = require('../utils/apiResponse');
const { ROLES } = require('../constants/roles');
const APIError = require('../utils/apiError');

const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    let data;

    switch (role) {
      case ROLES.ADMIN:
        data = await dashboardService.getAdminStats();
        break;
      case ROLES.ORGANIZER:
        data = await dashboardService.getOrganizerStats(req.user._id);
        break;
      case ROLES.PARTICIPANT:
        data = await dashboardService.getParticipantStats(req.user._id);
        break;
      case ROLES.JUDGE:
        data = await dashboardService.getJudgeStats(req.user._id);
        break;
      default:
        throw new APIError('Invalid user role for statistics', 400);
    }

    res.status(200).json(new APIResponse(200, data, 'Dashboard statistics retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
