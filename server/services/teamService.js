const Team = require('../models/Team');
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
const crypto = require('crypto');

class TeamService {
  /**
   * Helper to generate unique join code
   */
  generateJoinCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  }

  /**
   * Create a new team
   */
  async createTeam({ hackathonId, name }, userId) {
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      const error = new Error('Hackathon not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user is already in a team for this hackathon
    const existingTeam = await Team.findOne({
      hackathon: hackathonId,
      $or: [{ leader: userId }, { members: userId }],
    });

    if (existingTeam) {
      const error = new Error('You are already a member or leader of a team in this hackathon');
      error.statusCode = 400;
      throw error;
    }

    const joinCode = this.generateJoinCode();

    const team = await Team.create({
      name,
      hackathon: hackathonId,
      leader: userId,
      members: [userId],
      joinCode,
      status: 'pending',
    });

    return await Team.findById(team._id)
      .populate('hackathon', 'title maxTeamSize status startDate endDate')
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar skills');
  }

  /**
   * Join a team using join code
   */
  async joinTeamByCode(joinCode, userId) {
    if (!joinCode) {
      const error = new Error('Join code is required');
      error.statusCode = 400;
      throw error;
    }

    const team = await Team.findOne({ joinCode: joinCode.trim().toUpperCase() }).populate('hackathon');
    if (!team) {
      const error = new Error('Invalid team join code');
      error.statusCode = 404;
      throw error;
    }

    const hackathon = team.hackathon;
    if (hackathon && team.members.length >= hackathon.maxTeamSize) {
      const error = new Error(`Team has reached the maximum allowed limit of ${hackathon.maxTeamSize} members`);
      error.statusCode = 400;
      throw error;
    }

    // Check if user is already in a team for this hackathon
    const existingTeam = await Team.findOne({
      hackathon: team.hackathon._id,
      $or: [{ leader: userId }, { members: userId }],
    });

    if (existingTeam) {
      const error = new Error('You are already in a team for this hackathon');
      error.statusCode = 400;
      throw error;
    }

    team.members.push(userId);
    await team.save();

    return await Team.findById(team._id)
      .populate('hackathon', 'title maxTeamSize status startDate endDate')
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar skills');
  }

  /**
   * Get all teams for logged-in user with optional search, filter, sort, and pagination
   */
  async getUserTeams(userId, params = {}) {
    const { search = '', status = '', sortBy = 'createdAt', order = 'desc', page, limit } = params;
    const query = {
      $or: [{ leader: userId }, { members: userId }],
    };

    if (search) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }
    if (status) {
      query.status = status;
    }

    const sortOrder = order === 'asc' || order === '1' ? 1 : -1;
    const sortObj = {};
    if (['createdAt', 'name'].includes(sortBy)) {
      sortObj[sortBy] = sortOrder;
    } else {
      sortObj.createdAt = -1;
    }

    if (page || limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const teams = await Team.find(query)
        .populate('hackathon', 'title maxTeamSize status startDate endDate prizePool')
        .populate('leader', 'name email avatar')
        .populate('members', 'name email avatar skills')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum);

      const total = await Team.countDocuments(query);
      const pages = Math.ceil(total / limitNum) || 1;

      return {
        teams,
        pagination: { total, page: pageNum, pages, limit: limitNum },
      };
    }

    const teams = await Team.find(query)
      .populate('hackathon', 'title maxTeamSize status startDate endDate prizePool')
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar skills')
      .sort(sortObj);

    return teams;
  }

  /**
   * Get teams for a hackathon with optional search, filter, sort, and pagination
   */
  async getHackathonTeams(hackathonId, params = {}) {
    const { search = '', status = '', sortBy = 'createdAt', order = 'desc', page, limit } = params;
    const query = {};
    if (hackathonId) {
      query.hackathon = hackathonId;
    }
    if (search) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }
    if (status) {
      query.status = status;
    }

    const sortOrder = order === 'asc' || order === '1' ? 1 : -1;
    const sortObj = {};
    if (['createdAt', 'name'].includes(sortBy)) {
      sortObj[sortBy] = sortOrder;
    } else {
      sortObj.createdAt = -1;
    }

    if (page || limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const teams = await Team.find(query)
        .populate('hackathon', 'title maxTeamSize status')
        .populate('leader', 'name email avatar')
        .populate('members', 'name email avatar skills')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum);

      const total = await Team.countDocuments(query);
      const pages = Math.ceil(total / limitNum) || 1;

      return {
        teams,
        pagination: { total, page: pageNum, pages, limit: limitNum },
      };
    }

    const teams = await Team.find(query)
      .populate('hackathon', 'title maxTeamSize status')
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar skills')
      .sort(sortObj);

    return teams;
  }


  /**
   * Get team details by ID
   */
  async getTeamById(teamId) {
    const team = await Team.findById(teamId)
      .populate('hackathon', 'title maxTeamSize status startDate endDate prizePool')
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar skills');

    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    return team;
  }

  /**
   * Invite member by email (Leader action)
   */
  async inviteMember(teamId, email, leaderId) {
    const team = await Team.findById(teamId).populate('hackathon');
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    if (team.leader.toString() !== leaderId.toString()) {
      const error = new Error('Only the team leader can invite members');
      error.statusCode = 403;
      throw error;
    }

    if (team.members.length >= team.hackathon.maxTeamSize) {
      const error = new Error(`Team is already full (max ${team.hackathon.maxTeamSize} members)`);
      error.statusCode = 400;
      throw error;
    }

    const invitedUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!invitedUser) {
      const error = new Error(`No user found with email "${email}"`);
      error.statusCode = 404;
      throw error;
    }

    // Check if user is already in a team for this hackathon
    const existingTeam = await Team.findOne({
      hackathon: team.hackathon._id,
      $or: [{ leader: invitedUser._id }, { members: invitedUser._id }],
    });

    if (existingTeam) {
      const error = new Error('Invited user is already in a team for this hackathon');
      error.statusCode = 400;
      throw error;
    }

    team.members.push(invitedUser._id);
    await team.save();

    return await Team.findById(team._id)
      .populate('hackathon', 'title maxTeamSize status')
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar skills');
  }

  /**
   * Remove member (Leader action)
   */
  async removeMember(teamId, memberId, leaderId) {
    const team = await Team.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    if (team.leader.toString() !== leaderId.toString()) {
      const error = new Error('Only the team leader can remove members');
      error.statusCode = 403;
      throw error;
    }

    if (memberId.toString() === leaderId.toString()) {
      const error = new Error('Team leader cannot remove themselves. Transfer leadership or delete the team.');
      error.statusCode = 400;
      throw error;
    }

    team.members = team.members.filter((m) => m.toString() !== memberId.toString());
    await team.save();

    return await Team.findById(team._id)
      .populate('hackathon', 'title maxTeamSize status')
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar skills');
  }

  /**
   * Transfer leadership (Leader action)
   */
  async transferLeadership(teamId, newLeaderId, currentLeaderId) {
    const team = await Team.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    if (team.leader.toString() !== currentLeaderId.toString()) {
      const error = new Error('Only the team leader can transfer leadership');
      error.statusCode = 403;
      throw error;
    }

    const isMember = team.members.some((m) => m.toString() === newLeaderId.toString());
    if (!isMember) {
      const error = new Error('New leader must be an existing team member');
      error.statusCode = 400;
      throw error;
    }

    team.leader = newLeaderId;
    await team.save();

    return await Team.findById(team._id)
      .populate('hackathon', 'title maxTeamSize status')
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar skills');
  }

  /**
   * Leave team (Member action)
   */
  async leaveTeam(teamId, userId) {
    const team = await Team.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    const isMember = team.members.some((m) => m.toString() === userId.toString());
    if (!isMember) {
      const error = new Error('You are not a member of this team');
      error.statusCode = 400;
      throw error;
    }

    if (team.leader.toString() === userId.toString()) {
      if (team.members.length > 1) {
        const error = new Error('Team leader must transfer leadership before leaving');
        error.statusCode = 400;
        throw error;
      }
      // Only member left is leader -> delete team
      await Team.findByIdAndDelete(teamId);
      return { message: 'Team deleted as sole leader left' };
    }

    team.members = team.members.filter((m) => m.toString() !== userId.toString());
    await team.save();

    return await Team.findById(team._id)
      .populate('hackathon', 'title maxTeamSize status')
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar skills');
  }

  /**
   * Delete team (Leader or Admin action)
   */
  async deleteTeam(teamId, userId, userRole) {
    const team = await Team.findById(teamId);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    if (team.leader.toString() !== userId.toString() && userRole !== 'admin') {
      const error = new Error('Only team leader or admin can delete the team');
      error.statusCode = 403;
      throw error;
    }

    await Team.findByIdAndDelete(teamId);
    return { message: 'Team deleted successfully' };
  }
}

module.exports = new TeamService();
