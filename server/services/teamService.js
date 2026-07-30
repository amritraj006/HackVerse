const Team = require('../models/Team');
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Registration = require('../models/Registration');
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

    // Check if user is registered solo for this hackathon
    const existingRegistration = await Registration.findOne({
      hackathon: hackathonId,
      participant: userId,
      status: 'active',
    });

    if (existingRegistration) {
      const error = new Error('You are registered solo for this hackathon. You must leave your solo registration before creating a team.');
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

    // Auto-create active registration for team leader on this hackathon
    await Registration.findOneAndUpdate(
      { hackathon: hackathonId, participant: userId },
      { status: 'active', registeredAt: new Date() },
      { upsert: true, new: true }
    );

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

    // Auto-create active registration for joining member on this hackathon
    await Registration.findOneAndUpdate(
      { hackathon: team.hackathon._id, participant: userId },
      { status: 'active', registeredAt: new Date() },
      { upsert: true, new: true }
    );

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
  /**
   * Invite member by email (Leader action) - Creates a pending invitation notification
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

    // Check if user is already a member of this team
    if (team.members.some((m) => m.toString() === invitedUser._id.toString())) {
      const error = new Error('User is already a member of this team');
      error.statusCode = 400;
      throw error;
    }

    // Check if user already has a pending invitation for this team
    const alreadyPending = (team.pendingInvites || []).some(
      (pi) => pi.user && pi.user.toString() === invitedUser._id.toString()
    );
    if (alreadyPending) {
      const error = new Error('An invitation has already been sent to this user');
      error.statusCode = 400;
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

    // Add to pendingInvites
    if (!team.pendingInvites) team.pendingInvites = [];
    team.pendingInvites.push({
      user: invitedUser._id,
      email: invitedUser.email,
      invitedBy: leaderId,
      invitedAt: new Date(),
    });
    await team.save();

    // Create persistent Notification for invited user
    const leaderUser = await User.findById(leaderId);
    await Notification.create({
      user: invitedUser._id,
      sender: leaderId,
      type: 'team_invite',
      title: `Team Invitation: ${team.name}`,
      message: `${leaderUser ? leaderUser.name : 'Team Leader'} invited you to join team "${team.name}" for "${team.hackathon.title}".`,
      team: team._id,
      hackathon: team.hackathon._id,
      status: 'pending',
    });

    return await Team.findById(team._id)
      .populate('hackathon', 'title maxTeamSize status')
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar skills');
  }

  /**
   * Accept Team Invitation
   */
  async acceptInvitation(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
      type: 'team_invite',
    });

    if (!notification) {
      const error = new Error('Invitation notification not found');
      error.statusCode = 404;
      throw error;
    }

    if (notification.status !== 'pending') {
      const error = new Error(`Invitation has already been ${notification.status}`);
      error.statusCode = 400;
      throw error;
    }

    const team = await Team.findById(notification.team).populate('hackathon');
    if (!team) {
      const error = new Error('Team no longer exists');
      error.statusCode = 404;
      throw error;
    }

    if (team.members.length >= team.hackathon.maxTeamSize) {
      const error = new Error(`Team is already full (max ${team.hackathon.maxTeamSize} members)`);
      error.statusCode = 400;
      throw error;
    }

    // Check if user is already in a team for this hackathon
    const existingTeam = await Team.findOne({
      hackathon: team.hackathon._id,
      $or: [{ leader: userId }, { members: userId }],
    });

    if (existingTeam) {
      const error = new Error('You are already a member or leader of a team in this hackathon');
      error.statusCode = 400;
      throw error;
    }

    // Add to team members and remove from pendingInvites
    if (!team.members.some((m) => m.toString() === userId.toString())) {
      team.members.push(userId);
    }
    if (team.pendingInvites) {
      team.pendingInvites = team.pendingInvites.filter(
        (pi) => pi.user && pi.user.toString() !== userId.toString()
      );
    }
    await team.save();

    // Auto-create active registration for accepting member on this hackathon
    await Registration.findOneAndUpdate(
      { hackathon: team.hackathon._id, participant: userId },
      { status: 'active', registeredAt: new Date() },
      { upsert: true, new: true }
    );

    // Update notification status
    notification.status = 'accepted';
    await notification.save();

    return { message: `Successfully joined team "${team.name}"!`, team };
  }

  /**
   * Reject Team Invitation
   */
  async rejectInvitation(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
      type: 'team_invite',
    });

    if (!notification) {
      const error = new Error('Invitation notification not found');
      error.statusCode = 404;
      throw error;
    }

    const team = await Team.findById(notification.team);
    if (team && team.pendingInvites) {
      team.pendingInvites = team.pendingInvites.filter(
        (pi) => pi.user && pi.user.toString() !== userId.toString()
      );
      await team.save();
    }

    notification.status = 'rejected';
    await notification.save();

    return { message: 'Invitation declined' };
  }

  /**
   * Remove member (Leader action)
   */
  async removeMember(teamId, memberId, leaderId) {
    const team = await Team.findById(teamId).populate('hackathon');
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

    const hackathonId = team.hackathon?._id || team.hackathon;

    // Automatically remove member from hackathon registration
    await Registration.findOneAndUpdate(
      { hackathon: hackathonId, participant: memberId },
      { status: 'cancelled' }
    );

    // Create notification entry for the removed member
    const leaderUser = await User.findById(leaderId);
    const hackathonTitle = team.hackathon?.title || 'the hackathon';
    await Notification.create({
      user: memberId,
      sender: leaderId,
      type: 'team_removed',
      title: `Removed from Team: ${team.name}`,
      message: `${leaderUser ? leaderUser.name : 'Team Leader'} removed you from team "${team.name}" for "${hackathonTitle}". You are now eligible to register solo or join/create another team.`,
      team: team._id,
      hackathon: hackathonId,
      status: 'read',
    });

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
      // Sole leader leaving -> disestablish team and cancel registration for leader
      await Registration.findOneAndUpdate(
        { hackathon: team.hackathon, participant: userId },
        { status: 'cancelled' }
      );
      await Team.findByIdAndDelete(teamId);
      return { message: 'Team deleted as sole leader left' };
    }

    team.members = team.members.filter((m) => m.toString() !== userId.toString());
    await team.save();

    // Cancel registration for the leaving member
    await Registration.findOneAndUpdate(
      { hackathon: team.hackathon, participant: userId },
      { status: 'cancelled' }
    );

    return await Team.findById(team._id)
      .populate('hackathon', 'title maxTeamSize status')
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar skills');
  }

  /**
   * Delete team (Leader or Admin action)
   */
  async deleteTeam(teamId, userId, userRole) {
    const team = await Team.findById(teamId).populate('hackathon');
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

    const hackathonId = team.hackathon?._id || team.hackathon;

    // Cancel registrations and notify all team members
    for (const memberId of team.members) {
      await Registration.findOneAndUpdate(
        { hackathon: hackathonId, participant: memberId },
        { status: 'cancelled' }
      );

      if (memberId.toString() !== userId.toString()) {
        const leaderUser = await User.findById(userId);
        await Notification.create({
          user: memberId,
          sender: userId,
          type: 'system',
          title: `Team Disestablished: ${team.name}`,
          message: `${leaderUser ? leaderUser.name : 'Team Leader'} deleted team "${team.name}". Your registration for "${team.hackathon?.title || 'the hackathon'}" has been cancelled.`,
          hackathon: hackathonId,
          status: 'read',
        });
      }
    }

    await Team.findByIdAndDelete(teamId);
    return { message: 'Team deleted successfully' };
  }
}

module.exports = new TeamService();
