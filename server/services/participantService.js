const Registration = require('../models/Registration');
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');
const Team = require('../models/Team');

class ParticipantService {
  /**
   * Register participant for a hackathon
   */
  async registerForHackathon(hackathonId, participantId, userRole) {
    if (userRole && userRole !== 'participant') {
      const error = new Error('Only users with the Participant role can register for hackathons. Hosts, Judges, and Admins cannot participate.');
      error.statusCode = 403;
      throw error;
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      const error = new Error('Hackathon not found');
      error.statusCode = 404;
      throw error;
    }

    if (!hackathon.isRegistrationOpen) {
      const error = new Error('Registrations for this hackathon are currently closed');
      error.statusCode = 400;
      throw error;
    }

    if (hackathon.status === 'ended' || hackathon.status === 'cancelled') {
      const error = new Error('Cannot register for a hackathon that has ended or been cancelled');
      error.statusCode = 400;
      throw error;
    }

    // Check participant limit slots availability
    const hackathonService = require('./hackathonService');
    const stats = await hackathonService.getParticipantStats(hackathonId);
    if (hackathon.maxParticipants > 0 && stats.totalRegisteredUsers >= hackathon.maxParticipants) {
      const error = new Error(`Registration full: This hackathon has reached its maximum capacity of ${hackathon.maxParticipants} participants.`);
      error.statusCode = 400;
      throw error;
    }

    // Check if user is already in a team for this hackathon
    const existingTeam = await Team.findOne({
      hackathon: hackathonId,
      $or: [{ leader: participantId }, { members: participantId }],
    });

    if (existingTeam) {
      const error = new Error('You are already registered via a team in this hackathon');
      error.statusCode = 400;
      throw error;
    }

    // Check for duplicate registration
    const existing = await Registration.findOne({
      hackathon: hackathonId,
      participant: participantId,
    });

    if (existing) {
      if (existing.status === 'active') {
        const error = new Error('You are already registered for this hackathon');
        error.statusCode = 409;
        throw error;
      }
      // Re-activate cancelled registration
      existing.status = 'active';
      existing.registeredAt = new Date();
      await existing.save();
      return await Registration.findById(existing._id)
        .populate('hackathon', 'title tagline status prizePool startDate endDate registrationDeadline maxTeamSize')
        .populate('participant', 'name email');
    }

    const registration = await Registration.create({
      hackathon: hackathonId,
      participant: participantId,
    });

    return await Registration.findById(registration._id)
      .populate('hackathon', 'title tagline status prizePool startDate endDate registrationDeadline maxTeamSize')
      .populate('participant', 'name email');
  }

  /**
   * Cancel participant registration for a hackathon
   */
  async cancelRegistration(hackathonId, participantId) {
    const Team = require('../models/Team');
    const Notification = require('../models/Notification');

    // Check if user is in a team for this hackathon
    const team = await Team.findOne({
      hackathon: hackathonId,
      $or: [{ leader: participantId }, { members: participantId }],
    }).populate('hackathon');

    if (team) {
      // Check if participant is the team creator (leader)
      if (team.leader.toString() !== participantId.toString()) {
        const error = new Error('Only the team creator can cancel the team registration from the hackathon');
        error.statusCode = 403;
        throw error;
      }

      // Creator is cancelling team registration: update all members' registrations & disestablish team
      for (const memberId of team.members) {
        await Registration.findOneAndUpdate(
          { hackathon: hackathonId, participant: memberId },
          { status: 'cancelled' }
        );

        if (memberId.toString() !== participantId.toString()) {
          const leaderUser = await User.findById(participantId);
          await Notification.create({
            user: memberId,
            sender: participantId,
            type: 'system',
            title: `Team Registration Cancelled: ${team.name}`,
            message: `${leaderUser ? leaderUser.name : 'Team Creator'} cancelled team "${team.name}" registration for "${team.hackathon?.title || 'the hackathon'}". You are now free to register solo or join another team.`,
            team: team._id,
            hackathon: hackathonId,
            status: 'read',
          });
        }
      }

      await Team.findByIdAndDelete(team._id);
      return { message: 'Team registration cancelled successfully' };
    }

    // User is solo registered
    const registration = await Registration.findOne({
      hackathon: hackathonId,
      participant: participantId,
      status: 'active',
    });

    if (!registration) {
      const error = new Error('No active registration found for this hackathon');
      error.statusCode = 404;
      throw error;
    }

    registration.status = 'cancelled';
    await registration.save();
    return registration;
  }

  /**
   * Get registration history for a participant
   * Also includes hackathons the user joined via team invitation acceptance.
   */
  async getMyRegistrations(participantId, { status = '', page = 1, limit = 10 }) {
    const query = { participant: participantId };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Direct registrations
    const registrations = await Registration.find(query)
      .populate(
        'hackathon',
        'title tagline status prizePool startDate endDate registrationDeadline maxTeamSize isRegistrationOpen isResultsPublished'
      )
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Also find hackathons user joined as team member (where no direct registration exists)
    const myTeams = await Team.find({
      $or: [{ leader: participantId }, { members: participantId }],
    }).select('hackathon');

    const teamHackathonIds = myTeams.map((t) => t.hackathon?.toString()).filter(Boolean);
    const directHackathonIds = registrations.map((r) => r.hackathon?._id?.toString()).filter(Boolean);

    // Synthesize missing team-based registrations (not in direct registrations)
    const missingHackathonIds = teamHackathonIds.filter((hid) => !directHackathonIds.includes(hid));

    let teamBasedRegs = [];
    if (missingHackathonIds.length > 0) {
      // Upsert registrations for these so they are visible
      for (const hackId of missingHackathonIds) {
        await Registration.findOneAndUpdate(
          { hackathon: hackId, participant: participantId },
          { status: 'active', $setOnInsert: { registeredAt: new Date() } },
          { upsert: true, new: true }
        );
      }
      teamBasedRegs = await Registration.find({
        hackathon: { $in: missingHackathonIds },
        participant: participantId,
      }).populate(
        'hackathon',
        'title tagline status prizePool startDate endDate registrationDeadline maxTeamSize isRegistrationOpen isResultsPublished'
      );
    }

    const allRegistrations = [...registrations, ...teamBasedRegs];

    // Fetch user's teams for all registrations to include team info & canCancel flag
    const hackathonIds = allRegistrations.map((r) => r.hackathon?._id || r.hackathon).filter(Boolean);
    const userTeams = await Team.find({
      hackathon: { $in: hackathonIds },
      $or: [{ leader: participantId }, { members: participantId }],
    }).select('name leader members hackathon');

    const teamMap = {};
    userTeams.forEach((t) => {
      if (t.hackathon) {
        const hid = t.hackathon.toString();
        const isLeader = t.leader?.toString() === participantId.toString();
        teamMap[hid] = {
          _id: t._id,
          name: t.name,
          leader: t.leader,
          isLeader,
        };
      }
    });

    const enrichedRegistrations = allRegistrations.map((reg) => {
      const regObj = reg.toObject ? reg.toObject() : { ...reg };
      const hackId = (reg.hackathon?._id || reg.hackathon)?.toString();
      const teamInfo = teamMap[hackId] || null;
      regObj.team = teamInfo;
      // User can cancel if they are solo registered (no team) OR if they are the team leader
      regObj.canCancel = !teamInfo || teamInfo.isLeader;
      return regObj;
    });

    const total = await Registration.countDocuments(query) + teamBasedRegs.length;
    const pages = Math.ceil(total / parseInt(limit, 10)) || 1;

    return {
      registrations: enrichedRegistrations,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages,
        limit: parseInt(limit, 10),
      },
    };
  }

  /**
   * Check registration status for a single hackathon
   */
  async getRegistrationStatus(hackathonId, participantId) {
    const registration = await Registration.findOne({
      hackathon: hackathonId,
      participant: participantId,
    }).populate('participant', 'name email avatar role');

    const userTeam = await Team.findOne({
      hackathon: hackathonId,
      $or: [{ leader: participantId }, { members: participantId }],
    })
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar skills');

    const Submission = require('../models/Submission');
    let submission = null;

    if (userTeam) {
      submission = await Submission.findOne({
        hackathon: hackathonId,
        team: userTeam._id,
      }).select('title tagline status score createdAt');
    } else if (registration) {
      submission = await Submission.findOne({
        hackathon: hackathonId,
        submittedBy: participantId,
      }).select('title tagline status score createdAt');
    }

    const isRegistered = (!!registration && registration.status === 'active') || !!userTeam;

    return {
      isRegistered,
      status: isRegistered ? 'active' : (registration ? registration.status : null),
      registration: registration || null,
      team: userTeam || null,
      submission: submission || null,
    };
  }

  /**
   * Get registration count per hackathon (for organizer use)
   */
  async getHackathonRegistrationCount(hackathonId) {
    return await Registration.countDocuments({
      hackathon: hackathonId,
      status: 'active',
    });
  }
}

module.exports = new ParticipantService();
