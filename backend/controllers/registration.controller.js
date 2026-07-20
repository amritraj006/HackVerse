const registrationService = require('../services/registration.service');
const APIResponse = require('../utils/apiResponse');

const registerForHackathon = async (req, res, next) => {
  try {
    const { hackathonId } = req.body;
    const registration = await registrationService.registerForHackathon(req.user._id, hackathonId);
    res.status(201).json(new APIResponse(201, { registration }, 'Registered for hackathon successfully'));
  } catch (error) {
    next(error);
  }
};

const getRegistrationStatus = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;
    const registration = await registrationService.getRegistrationStatus(req.user._id, hackathonId);
    res.status(200).json(new APIResponse(200, { registration }, 'Registration status retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const cancelRegistration = async (req, res, next) => {
  try {
    const { hackathonId } = req.body;
    const registration = await registrationService.cancelRegistration(req.user._id, hackathonId);
    res.status(200).json(new APIResponse(200, { registration }, 'Registration cancelled successfully'));
  } catch (error) {
    next(error);
  }
};

const getHackathonRegistrations = async (req, res, next) => {
  try {
    const registrations = await registrationService.getHackathonRegistrations(req.params.hackathonId);
    res.status(200).json(new APIResponse(200, { registrations }, 'Hackathon registrations retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForHackathon,
  getRegistrationStatus,
  cancelRegistration,
  getHackathonRegistrations,
};
