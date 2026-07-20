const Registration = require('../models/registration.model');
const Hackathon = require('../models/hackathon.model');
const Team = require('../models/team.model');
const APIError = require('../utils/apiError');
const { REGISTRATION_STATUS } = require('../constants/roles');

const registerForHackathon = async (userId, hackathonId) => {
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) {
    throw new APIError('Hackathon not found', 404);
  }

  // Check deadline
  if (new Date() > new Date(hackathon.registrationDeadline)) {
    throw new APIError('Registration deadline has passed', 400);
  }

  const existingReg = await Registration.findOne({ user: userId, hackathon: hackathonId });
  if (existingReg) {
    if (existingReg.status === REGISTRATION_STATUS.REGISTERED) {
      throw new APIError('You are already registered for this hackathon', 400);
    } else {
      // Reactivate cancelled registration
      existingReg.status = REGISTRATION_STATUS.REGISTERED;
      existingReg.registeredAt = new Date();
      await existingReg.save();
      return existingReg;
    }
  }

  const registration = await Registration.create({
    user: userId,
    hackathon: hackathonId,
    status: REGISTRATION_STATUS.REGISTERED,
  });

  return registration;
};

const getRegistrationStatus = async (userId, hackathonId) => {
  const registration = await Registration.findOne({ user: userId, hackathon: hackathonId })
    .populate('team');
  return registration;
};

const cancelRegistration = async (userId, hackathonId) => {
  const registration = await Registration.findOne({ user: userId, hackathon: hackathonId });
  if (!registration) {
    throw new APIError('Registration not found', 404);
  }

  // Check if user is in a team
  if (registration.team) {
    throw new APIError('You must leave or disband your team before cancelling registration', 400);
  }

  registration.status = REGISTRATION_STATUS.CANCELLED;
  await registration.save();

  return registration;
};

const getHackathonRegistrations = async (hackathonId) => {
  return await Registration.find({ hackathon: hackathonId, status: REGISTRATION_STATUS.REGISTERED })
    .populate('user', 'name email profileImage bio skills')
    .populate('team', 'name inviteCode')
    .sort({ registeredAt: -1 });
};

module.exports = {
  registerForHackathon,
  getRegistrationStatus,
  cancelRegistration,
  getHackathonRegistrations,
};
