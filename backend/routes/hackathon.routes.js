const express = require('express');
const hackathonController = require('../controllers/hackathon.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createHackathonSchema, updateHackathonSchema } = require('../validations/hackathon.validation');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/', hackathonController.getHackathons);

router.get(
  '/organizer',
  protect,
  authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN),
  hackathonController.getOrganizerHackathons
);

router.get('/:id', hackathonController.getHackathonById);

router.post(
  '/',
  protect,
  authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN),
  validate(createHackathonSchema),
  hackathonController.createHackathon
);

router.put(
  '/:id',
  protect,
  authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN),
  validate(updateHackathonSchema),
  hackathonController.updateHackathon
);

router.delete(
  '/:id',
  protect,
  authorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN),
  hackathonController.deleteHackathon
);

module.exports = router;
