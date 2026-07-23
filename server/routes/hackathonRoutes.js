const express = require('express');
const router = express.Router();
const {
  getHackathons,
  getHackathonById,
  getMyEvents,
  createHackathon,
  updateHackathon,
  deleteHackathon,
  toggleRegistration,
  assignJudges,
  publishResults,
  getTeams,
  updateTeamStatus,
  getSubmissions,
  getLeaderboard,
  getLeaderboardPreview,
} = require('../controllers/hackathonController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createHackathonValidationRules } = require('../validations/hackathonValidation');

// Public routes
router.get('/', getHackathons);
router.get('/my-events', protect, authorize('organizer', 'admin'), getMyEvents);
router.get('/:id/leaderboard', getLeaderboard);
router.get('/:id/leaderboard/preview', protect, authorize('organizer', 'admin'), getLeaderboardPreview);
router.get('/:id', getHackathonById);

// Organizer & Admin Protected Routes
router.post(
  '/',
  protect,
  authorize('organizer', 'admin'),
  createHackathonValidationRules,
  createHackathon
);

router.put(
  '/:id',
  protect,
  authorize('organizer', 'admin'),
  createHackathonValidationRules,
  updateHackathon
);

router.delete(
  '/:id',
  protect,
  authorize('organizer', 'admin'),
  deleteHackathon
);

router.put(
  '/:id/registration',
  protect,
  authorize('organizer', 'admin'),
  toggleRegistration
);

router.put(
  '/:id/judges',
  protect,
  authorize('organizer', 'admin'),
  assignJudges
);

router.put(
  '/:id/results',
  protect,
  authorize('organizer', 'admin'),
  publishResults
);

router.get(
  '/:id/teams',
  protect,
  authorize('organizer', 'admin'),
  getTeams
);

router.put(
  '/:id/teams/:teamId/status',
  protect,
  authorize('organizer', 'admin'),
  updateTeamStatus
);

router.get(
  '/:id/submissions',
  protect,
  authorize('organizer', 'judge', 'admin'),
  getSubmissions
);

module.exports = router;
