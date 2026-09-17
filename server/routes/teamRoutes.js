import express from 'express';
import {
  createTeam,
  joinTeamByCode,
  getMyTeams,
  getHackathonTeams,
  getTeamById,
  inviteMember,
  removeMember,
  transferLeadership,
  leaveTeam,
  deleteTeam,
} from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTeamValidationRules,
  joinTeamValidationRules,
} from '../validations/teamValidation.js';

const router = express.Router();

router.use(protect);

router.post('/', createTeamValidationRules, createTeam);
router.post('/join', joinTeamValidationRules, joinTeamByCode);
router.get('/my-teams', getMyTeams);
router.get('/hackathon/:hackathonId', getHackathonTeams);
router.get('/:id', getTeamById);

router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:memberId', removeMember);
router.put('/:id/transfer-leadership', transferLeadership);
router.post('/:id/leave', leaveTeam);
router.delete('/:id', deleteTeam);

export default router;
