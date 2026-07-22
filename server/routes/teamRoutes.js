const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createTeam);
router.post('/join', joinTeamByCode);
router.get('/my-teams', getMyTeams);
router.get('/hackathon/:hackathonId', getHackathonTeams);
router.get('/:id', getTeamById);

router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:memberId', removeMember);
router.put('/:id/transfer-leadership', transferLeadership);
router.post('/:id/leave', leaveTeam);
router.delete('/:id', deleteTeam);

module.exports = router;
