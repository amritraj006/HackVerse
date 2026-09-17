import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import participantService from '../services/participantService.js';

/**
 * @desc    Register current user for a hackathon
 * @route   POST /api/v1/registrations/:hackathonId
 * @access  Private (Participant/Admin)
 */
export const register = asyncHandler(async (req, res) => {
  const registration = await participantService.registerForHackathon(
    req.params.hackathonId,
    req.user.id,
    req.user.role
  );
  return successResponse(res, 201, 'Successfully registered for the hackathon!', registration);
});

/**
 * @desc    Cancel registration for a hackathon
 * @route   DELETE /api/v1/registrations/:hackathonId
 * @access  Private (Participant/Admin)
 */
export const cancelRegistration = asyncHandler(async (req, res) => {
  const result = await participantService.cancelRegistration(
    req.params.hackathonId,
    req.user.id
  );
  return successResponse(res, 200, 'Registration cancelled successfully', result);
});

/**
 * @desc    Get logged-in participant's registration history
 * @route   GET /api/v1/registrations/my-registrations
 * @access  Private
 */
export const getMyRegistrations = asyncHandler(async (req, res) => {
  const result = await participantService.getMyRegistrations(req.user.id, req.query);
  return successResponse(res, 200, 'Registrations retrieved successfully', result);
});

/**
 * @desc    Check registration status for a specific hackathon
 * @route   GET /api/v1/registrations/:hackathonId/status
 * @access  Private
 */
export const getRegistrationStatus = asyncHandler(async (req, res) => {
  const result = await participantService.getRegistrationStatus(
    req.params.hackathonId,
    req.user.id
  );
  return successResponse(res, 200, 'Registration status retrieved', result);
});

export default {
  register,
  cancelRegistration,
  getMyRegistrations,
  getRegistrationStatus,
};
