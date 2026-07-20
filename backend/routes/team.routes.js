const express = require('express');
const teamController = require('../controllers/team.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createTeamSchema, joinTeamSchema } = require('../validations/team.validation');

const router = express.Router();

router.post('/', protect, validate(createTeamSchema), teamController.createTeam);
router.post('/join', protect, validate(joinTeamSchema), teamController.joinTeam);
router.get('/:id', protect, teamController.getTeamDetails);
router.get('/my/:hackathonId', protect, teamController.getMyTeamForHackathon);
router.delete('/:id/leave', protect, teamController.leaveTeam);

module.exports = router;
