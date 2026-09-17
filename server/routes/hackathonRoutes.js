import express from 'express';
import {
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
  getParticipants,
  updateTeamStatus,
  getSubmissions,
  getLeaderboard,
  getLeaderboardPreview,
  getJudgeView,
} from '../controllers/hackathonController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createHackathonValidationRules,
  updateHackathonValidationRules,
} from '../validations/hackathonValidation.js';

const router = express.Router();

// Public routes
router.get('/', getHackathons);
router.get('/my-events', protect, authorize('organizer', 'admin'), getMyEvents);
router.get('/:id/leaderboard', getLeaderboard);
router.get('/:id/leaderboard/preview', protect, authorize('organizer', 'admin'), getLeaderboardPreview);
router.get('/:id/judge-view', protect, authorize('judge', 'admin'), getJudgeView);
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
  updateHackathonValidationRules,
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

router.get(
  '/:id/participants',
  protect,
  authorize('organizer', 'admin'),
  getParticipants
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

export default router;
