const express = require('express');
const registrationController = require('../controllers/registration.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.post('/', protect, registrationController.registerForHackathon);
router.get('/my/:hackathonId', protect, registrationController.getRegistrationStatus);
router.post('/cancel', protect, registrationController.cancelRegistration);

router.get(
  '/hackathon/:hackathonId',
  protect,
  authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN),
  registrationController.getHackathonRegistrations
);

module.exports = router;
