const express = require('express');
const router = express.Router();
const { getHackathons, getHackathonById, createHackathon } = require('../controllers/hackathonController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createHackathonValidationRules } = require('../validations/hackathonValidation');

router.get('/', getHackathons);
router.get('/:id', getHackathonById);
router.post('/', protect, authorize('organizer', 'admin'), createHackathonValidationRules, createHackathon);

module.exports = router;
