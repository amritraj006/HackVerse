const Team = require('../models/team.model');
const Hackathon = require('../models/hackathon.model');
const Registration = require('../models/registration.model');
const APIError = require('../utils/apiError');
const { REGISTRATION_STATUS } = require('../constants/roles');

// Helper to generate a unique random string
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const createTeam = async (leaderId, { name, hackathon }) => {
  // 1. Verify hackathon exists
  const hack = await Hackathon.findById(hackathon);
  if (!hack) {
    throw new APIError('Hackathon not found', 404);
  }

  // 2. Check if deadline has passed
  if (new Date() > new Date(hack.registrationDeadline)) {
    throw new APIError('Registration deadline has passed', 400);
  }

  // 3. Check if user is already in a team for this hackathon
  const existingTeam = await Team.findOne({
    hackathon,
    $or: [{ leader: leaderId }, { members: leaderId }],
  });

  if (existingTeam) {
    throw new APIError('You are already a member of a team in this hackathon', 400);
  }

  // 4. Generate unique invite code
  let inviteCode;
  let codeUnique = false;
  while (!codeUnique) {
    inviteCode = generateInviteCode();
    const duplicate = await Team.findOne({ inviteCode });
    if (!duplicate) codeUnique = true;
  }

  // 5. Create Team
  const team = await Team.create({
    name,
    hackathon,
    leader: leaderId,
    members: [leaderId], // Leader is counted as a member
    inviteCode,
  });

  // 6. Ensure Registration exists and link to team
  await Registration.findOneAndUpdate(
    { user: leaderId, hackathon },
    { team: team._id, status: REGISTRATION_STATUS.REGISTERED },
    { upsert: true, new: true }
  );

  return team;
};

const joinTeam = async (userId, { inviteCode }) => {
  // 1. Find team
  const team = await Team.findOne({ inviteCode });
  if (!team) {
    throw new APIError('Invalid invite code. Team not found.', 404);
  }

  const hackathonId = team.hackathon;
  const hack = await Hackathon.findById(hackathonId);
  if (!hack) {
    throw new APIError('Associated hackathon not found', 404);
  }

  // 2. Check registration deadline
  if (new Date() > new Date(hack.registrationDeadline)) {
    throw new APIError('Registration deadline has passed', 400);
  }

  // 3. Check team size limits
  if (team.members.length >= hack.maxTeamSize) {
    throw new APIError(`Team is full. Maximum size allowed is ${hack.maxTeamSize}`, 400);
  }

  // 4. Check if user is already in a team for this hackathon
  const alreadyInTeam = await Team.findOne({
    hackathon: hackathonId,
    $or: [{ leader: userId }, { members: userId }],
  });

  if (alreadyInTeam) {
    throw new APIError('You are already in a team for this hackathon', 400);
  }

  // 5. Add member to team
  team.members.push(userId);
  await team.save();

  // 6. Upsert/Update Registration
  await Registration.findOneAndUpdate(
    { user: userId, hackathon: hackathonId },
    { team: team._id, status: REGISTRATION_STATUS.REGISTERED },
    { upsert: true, new: true }
  );

  return team;
};

const getTeamDetails = async (teamId) => {
  const team = await Team.findById(teamId)
    .populate('leader', 'name email profileImage bio skills')
    .populate('members', 'name email profileImage bio skills')
    .populate('hackathon', 'title description startDate endDate status');

  if (!team) {
    throw new APIError('Team not found', 404);
  }

  return team;
};

const getMyTeamForHackathon = async (userId, hackathonId) => {
  const team = await Team.findOne({
    hackathon: hackathonId,
    $or: [{ leader: userId }, { members: userId }],
  })
  .populate('leader', 'name email profileImage')
  .populate('members', 'name email profileImage')
  .populate('hackathon', 'title description startDate endDate status minTeamSize maxTeamSize');

  return team;
};

const leaveTeam = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new APIError('Team not found', 404);
  }

  const hackathonId = team.hackathon;

  if (team.leader.toString() === userId.toString()) {
    // If team leader leaves, delete the team (disbands team)
    // Clear registration links for all members
    await Registration.updateMany(
      { team: teamId },
      { $set: { team: null } }
    );
    await team.deleteOne();
    return { disbanded: true };
  } else {
    // Regular member leaves
    team.members = team.members.filter(m => m.toString() !== userId.toString());
    await team.save();

    // Clear registration team link
    await Registration.findOneAndUpdate(
      { user: userId, hackathon: hackathonId },
      { $set: { team: null } }
    );
    return { disbanded: false, team };
  }
};

module.exports = {
  createTeam,
  joinTeam,
  getTeamDetails,
  getMyTeamForHackathon,
  leaveTeam,
};
