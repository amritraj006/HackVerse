const Hackathon = require('../models/hackathon.model');
const User = require('../models/user.model');
const { ROLES, HACKATHON_STATUS } = require('../constants/roles');
const APIError = require('../utils/apiError');

const createHackathon = async (organizerId, hackathonData) => {
  const hackathon = await Hackathon.create({
    ...hackathonData,
    organizer: organizerId,
  });
  return hackathon;
};

const getHackathons = async ({ search, theme, mode, status }) => {
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { theme: { $regex: search, $options: 'i' } },
    ];
  }

  if (theme) {
    query.theme = { $regex: theme, $options: 'i' };
  }

  if (mode) {
    query.mode = mode;
  }

  if (status) {
    query.status = status;
  }

  return await Hackathon.find(query)
    .populate('organizer', 'name email profileImage')
    .sort({ startDate: 1 });
};

const getHackathonById = async (id) => {
  const hackathon = await Hackathon.findById(id)
    .populate('organizer', 'name email profileImage bio')
    .populate('judges', 'name email profileImage bio skills');

  if (!hackathon) {
    throw new APIError('Hackathon not found', 404);
  }

  return hackathon;
};

const updateHackathon = async (id, userId, userRole, updateData) => {
  const hackathon = await Hackathon.findById(id);
  if (!hackathon) {
    throw new APIError('Hackathon not found', 404);
  }

  // Check authorization: Admin can modify any; Organizer can modify their own
  if (userRole !== ROLES.ADMIN && hackathon.organizer.toString() !== userId.toString()) {
    throw new APIError('Not authorized to update this hackathon', 403);
  }

  // Perform updates
  const updatedHackathon = await Hackathon.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  return updatedHackathon;
};

const deleteHackathon = async (id, userId, userRole) => {
  const hackathon = await Hackathon.findById(id);
  if (!hackathon) {
    throw new APIError('Hackathon not found', 404);
  }

  if (userRole !== ROLES.ADMIN && hackathon.organizer.toString() !== userId.toString()) {
    throw new APIError('Not authorized to delete this hackathon', 403);
  }

  await hackathon.deleteOne();
  return { id };
};

const getOrganizerHackathons = async (organizerId) => {
  return await Hackathon.find({ organizer: organizerId }).sort({ createdAt: -1 });
};

const getJudgeHackathons = async (judgeId) => {
  return await Hackathon.find({ judges: judgeId }).sort({ createdAt: -1 });
};

module.exports = {
  createHackathon,
  getHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
  getOrganizerHackathons,
  getJudgeHackathons,
};
