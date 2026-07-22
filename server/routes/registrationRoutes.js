const express = require('express');
const router = express.Router();
const {
  register,
  cancelRegistration,
  getMyRegistrations,
  getRegistrationStatus,
} = require('../controllers/participantController');
const { protect } = require('../middleware/authMiddleware');

// All registration routes require authentication
router.use(protect);

// Registration history
router.get('/my-registrations', getMyRegistrations);

// Per-hackathon registration actions
router.get('/:hackathonId/status', getRegistrationStatus);
router.post('/:hackathonId', register);
router.delete('/:hackathonId', cancelRegistration);

module.exports = router;
