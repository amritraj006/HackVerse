import express from 'express';
import {
  register,
  cancelRegistration,
  getMyRegistrations,
  getRegistrationStatus,
} from '../controllers/participantController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All registration routes require authentication
router.use(protect);

// Registration history
router.get('/my-registrations', getMyRegistrations);

// Per-hackathon registration actions
router.get('/:hackathonId/status', getRegistrationStatus);
router.post('/:hackathonId', register);
router.delete('/:hackathonId', cancelRegistration);

export default router;
