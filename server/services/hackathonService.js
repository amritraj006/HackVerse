const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { updateHackathonStatuses } = require('../utils/hackathonScheduler');

class HackathonService {
  /**
   * Get all public hackathons
   */
  async getAllHackathons(params = {}) {
    await updateHackathonStatuses();
    const {
      search = '',
      status = '',
      isRegistrationOpen,
      tag = '',
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = params;

    const query = { status: 'upcoming' };

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { tagline: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    if (isRegistrationOpen !== undefined && isRegistrationOpen !== '') {
      query.isRegistrationOpen = isRegistrationOpen === 'true' || isRegistrationOpen === true;
    }

    if (tag) {
      query.tags = tag;
    }

    const sortOrder = order === 'asc' || order === '1' ? 1 : -1;
    const sortObj = {};
    const validSortFields = ['createdAt', 'startDate', 'endDate', 'registrationDeadline', 'title', 'maxTeamSize'];
    if (validSortFields.includes(sortBy)) {
      sortObj[sortBy] = sortOrder;
    } else {
      sortObj.createdAt = -1;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const hackathons = await Hackathon.find(query)
      .populate('organizer', 'name email avatar')
      .populate('assignedJudges', 'name email avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const hackathonsWithStats = await Promise.all(
      hackathons.map(async (h) => {
        const stats = await this.getParticipantStats(h._id);
        return {
          ...h,
          ...stats,
        };
      })
    );

    const total = await Hackathon.countDocuments(query);
    const pages = Math.ceil(total / limitNum) || 1;

    return {
      hackathons: hackathonsWithStats,
      pagination: {
        total,
        page: pageNum,
        pages,
        limit: limitNum,
      },
    };
  }

  /**
   * Helper to calculate participant breakdown and slot availability for a hackathon.
   * e.g. 3 teams with 3 members each = 9 team users, 11 solo users = 20 total users.
   */
  async getParticipantStats(hackathonId) {
    const hackathon = await Hackathon.findById(hackathonId).select('maxParticipants');
    const teams = await Team.find({ hackathon: hackathonId }).select('leader members');

    const teamMemberIds = new Set();
    teams.forEach((t) => {
      if (t.leader) teamMemberIds.add(t.leader.toString());
      (t.members || []).forEach((m) => teamMemberIds.add(m.toString()));
    });

    const registrations = await Registration.find({ hackathon: hackathonId, status: 'active' }).select('participant');
    const soloUserIds = new Set();

    registrations.forEach((r) => {
      if (r.participant) {
        const pid = (r.participant._id || r.participant).toString();
        if (!teamMemberIds.has(pid)) {
          soloUserIds.add(pid);
        }
      }
    });

    const teamUsersCount = teamMemberIds.size;
    const soloUsersCount = soloUserIds.size;
    const totalRegisteredUsers = teamUsersCount + soloUsersCount;
    const teamCount = teams.length;

    const maxParticipants = hackathon?.maxParticipants || 0;
    const availableSlots = maxParticipants > 0 ? Math.max(0, maxParticipants - totalRegisteredUsers) : null;

    return {
      totalRegisteredUsers,
      teamCount,
      teamUsersCount,
      soloUsersCount,
      maxParticipants,
      availableSlots,
    };
  }

  /**
   * Get single hackathon details
   */
  async getHackathonById(id) {
    await updateHackathonStatuses();
    const hackathon = await Hackathon.findById(id)
      .populate('organizer', 'name email avatar')
      .populate('assignedJudges', 'name email avatar skills')
      .populate({
        path: 'winners.submission',
        populate: { path: 'submittedBy', select: 'name email' },
      });

    if (!hackathon) {
      const error = new Error('Hackathon not found');
      error.statusCode = 404;
      throw error;
    }

    const stats = await this.getParticipantStats(id);
    const result = hackathon.toObject();
    Object.assign(result, stats);
    return result;
  }

  /**
   * Get events created by logged-in organizer
   */
  async getMyEvents(organizerId) {
    await updateHackathonStatuses();
    const events = await Hackathon.find({ organizer: organizerId })
      .populate('assignedJudges', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return await Promise.all(
      events.map(async (e) => {
        const stats = await this.getParticipantStats(e._id);
        return { ...e, ...stats };
      })
    );
  }

  /**
   * Create a new hackathon
   */
  async createHackathon(data, organizerId) {
    const {
      title,
      description,
      tagline,
      startDate,
      endDate,
      registrationDeadline,
      maxTeamSize,
      maxParticipants,
      prizePool,
      bannerImage,
      tags,
      status,
    } = data;

    const tagsArray = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const parsedMaxParticipants =
      maxParticipants !== undefined && maxParticipants !== ''
        ? Math.max(0, parseInt(maxParticipants, 10) || 0)
        : 0;

    const hackathon = await Hackathon.create({
      title,
      description,
      tagline: tagline || '',
      organizer: organizerId,
      startDate,
      endDate,
      registrationDeadline,
      maxTeamSize: maxTeamSize || 4,
      maxParticipants: parsedMaxParticipants,
      prizePool: prizePool || '$0',
      bannerImage: bannerImage || '',
      tags: tagsArray,
      status: status || 'upcoming',
      isRegistrationOpen: true,
    });

    return hackathon;
  }

  /**
   * Update existing hackathon (Organizer ownership check)
   */
  async updateHackathon(id, data, user) {
    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      const error = new Error('Hackathon not found');
      error.statusCode = 404;
      throw error;
    }

    if (hackathon.organizer.toString() !== user.id && user.role !== 'admin') {
      const error = new Error('Not authorized to modify this hackathon');
      error.statusCode = 403;
      throw error;
    }

    if (hackathon.status !== 'upcoming') {
      const error = new Error(
        `Editing is blocked. Hackathons can only be edited while their status is upcoming (current status: ${hackathon.status}).`
      );
      error.statusCode = 400;
      throw error;
    }

    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    if (data.maxParticipants !== undefined && data.maxParticipants !== '') {
      const parsedLimit = Math.max(0, parseInt(data.maxParticipants, 10) || 0);
      if (parsedLimit > 0) {
        const stats = await this.getParticipantStats(id);
        if (parsedLimit < stats.totalRegisteredUsers) {
          const error = new Error(
            `Cannot set participant limit to ${parsedLimit} because ${stats.totalRegisteredUsers} participants are already registered.`
          );
          error.statusCode = 400;
          throw error;
        }
      }
      data.maxParticipants = parsedLimit;
    }

    Object.assign(hackathon, data);
    await hackathon.save();
    return await this.getHackathonById(id);
  }


  /**
   * Delete hackathon with full cascade:
   * - Deletes all teams, submissions, and participant registrations
   * - Removes judge assignments (embedded in hackathon doc)
   * - Sends notifications to all participants, team creators, and assigned judges
   */
  async deleteHackathon(id, user) {
    const hackathon = await Hackathon.findById(id).populate('assignedJudges', '_id name');
    if (!hackathon) {
      const error = new Error('Hackathon not found');
      error.statusCode = 404;
      throw error;
    }

    if (hackathon.organizer.toString() !== user.id && user.role !== 'admin') {
      const error = new Error('Not authorized to delete this hackathon');
      error.statusCode = 403;
      throw error;
    }

    if (hackathon.status !== 'upcoming') {
      const error = new Error(
        `Deletion is blocked. Hackathons can only be deleted while their status is upcoming (current status: ${hackathon.status}).`
      );
      error.statusCode = 400;
      throw error;
    }

    const notificationMessage = `We regret to inform you that the hackathon "${hackathon.title}" has been cancelled by the organiser. All associated teams, registrations, and submissions have been removed.`;
    const notifiedUserIds = new Set();

    // 1. Collect all unique participants from registrations
    const registrations = await Registration.find({ hackathon: id }).select('participant');
    for (const reg of registrations) {
      notifiedUserIds.add(reg.participant.toString());
    }

    // 2. Collect all unique team creators and members
    const teams = await Team.find({ hackathon: id }).select('leader members');
    for (const team of teams) {
      if (team.leader) notifiedUserIds.add(team.leader.toString());
      for (const memberId of team.members) {
        notifiedUserIds.add(memberId.toString());
      }
    }

    // 3. Send notifications to all unique affected users (except the organiser themselves)
    const notificationDocs = [...notifiedUserIds]
      .filter((uid) => uid !== user.id)
      .map((uid) => ({
        user: uid,
        sender: user.id,
        type: 'hackathon',
        title: `Hackathon Cancelled: ${hackathon.title}`,
        message: notificationMessage,
        hackathon: hackathon._id,
        status: 'read',
      }));

    // 4. Also notify all assigned judges (if not already included)
    for (const judge of hackathon.assignedJudges || []) {
      const judgeId = (judge._id || judge).toString();
      if (judgeId !== user.id && !notifiedUserIds.has(judgeId)) {
        notificationDocs.push({
          user: judgeId,
          sender: user.id,
          type: 'hackathon',
          title: `Hackathon Cancelled: ${hackathon.title}`,
          message: notificationMessage,
          hackathon: hackathon._id,
          status: 'read',
        });
      }
    }

    if (notificationDocs.length > 0) {
      await Notification.insertMany(notificationDocs);
    }

    // 5. Cascade delete in order: teams → submissions → registrations → hackathon
    await Team.deleteMany({ hackathon: id });
    await Submission.deleteMany({ hackathon: id });
    await Registration.deleteMany({ hackathon: id });
    await Hackathon.findByIdAndDelete(id);

    return {
      id,
      message: `Hackathon "${hackathon.title}" and all associated data deleted successfully`,
      deleted: {
        teams: teams.length,
        registrations: registrations.length,
        notified: notificationDocs.length,
      },
    };
  }

  /**
   * Toggle open/closed registration status
   */
  async toggleRegistrationStatus(id, isOpen, user) {
    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      const error = new Error('Hackathon not found');
      error.statusCode = 404;
      throw error;
    }

    if (hackathon.organizer.toString() !== user.id && user.role !== 'admin') {
      const error = new Error('Not authorized to modify this hackathon');
      error.statusCode = 403;
      throw error;
    }

    // ─── RESTRICTION: Cannot re-open registration once hackathon has started ──
    const hasStarted = ['ongoing', 'ended'].includes(hackathon.status) ||
      (hackathon.startDate && new Date() >= new Date(hackathon.startDate));

    const wantsToOpen = isOpen !== undefined ? isOpen : !hackathon.isRegistrationOpen;

    if (hasStarted && wantsToOpen) {
      const error = new Error('Registration cannot be re-opened after the hackathon has started.');
      error.statusCode = 400;
      throw error;
    }

    hackathon.isRegistrationOpen = wantsToOpen;
    await hackathon.save();
    return hackathon;
  }


  /**
   * Assign judges to hackathon — sends a judge_invite notification to each judge.
   * Judges appear in pendingJudges until they accept; only then are they moved
   * into assignedJudges and gain access to the evaluation portal.
   */
  async assignJudges(id, judgeIds, user) {
    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      const error = new Error('Hackathon not found');
      error.statusCode = 404;
      throw error;
    }

    if (hackathon.organizer.toString() !== user.id && user.role !== 'admin') {
      const error = new Error('Not authorized to manage judges for this hackathon');
      error.statusCode = 403;
      throw error;
    }

    // ─── RESTRICTION: Only 1 judge may be assigned per hackathon ───────────
    if (judgeIds.length > 1) {
      const error = new Error('Only one judge can be assigned per hackathon. Please select exactly one judge.');
      error.statusCode = 400;
      throw error;
    }

    // Verify all IDs belong to judge/admin accounts
    const validJudges = await User.find({ _id: { $in: judgeIds }, role: { $in: ['judge', 'admin'] } });
    const validJudgeIds = validJudges.map((j) => j._id.toString());

    // Determine which judges are newly invited (not already pending or accepted)
    const alreadyAssigned = new Set(hackathon.assignedJudges.map((j) => j.toString()));
    const alreadyPending = new Set(hackathon.pendingJudges.map((j) => j.toString()));

    const newInvites = validJudges.filter(
      (j) => !alreadyAssigned.has(j._id.toString()) && !alreadyPending.has(j._id.toString())
    );

    // Replace pending with the newly selected judge (max 1)
    hackathon.pendingJudges = validJudgeIds
      .filter((jid) => !alreadyAssigned.has(jid));

    hackathon.assignedJudges = hackathon.assignedJudges
      .filter((jid) => validJudgeIds.includes(jid.toString()));

    await hackathon.save();

    // Send judge_invite notifications to newly added judges
    if (newInvites.length > 0) {
      const notificationDocs = newInvites.map((judge) => ({
        user: judge._id,
        sender: user.id,
        type: 'judge_invite',
        title: `Judge Invitation: ${hackathon.title}`,
        message: `You have been invited to judge the hackathon "${hackathon.title}". Please accept or decline this invitation.`,
        hackathon: hackathon._id,
        status: 'pending',
      }));
      await Notification.insertMany(notificationDocs);
    }

    return await Hackathon.findById(id)
      .populate('assignedJudges', 'name email avatar skills')
      .populate('pendingJudges', 'name email avatar skills');
  }

  /**
   * Accept a judge_invite notification — moves judge from pendingJudges → assignedJudges
   * and notifies the organiser.
   */
  async acceptJudgeInvite(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
      type: 'judge_invite',
    });

    if (!notification) {
      const error = new Error('Judge invitation not found');
      error.statusCode = 404;
      throw error;
    }

    if (notification.status !== 'pending') {
      const error = new Error(`This invitation has already been ${notification.status}`);
      error.statusCode = 400;
      throw error;
    }

    const hackathon = await Hackathon.findById(notification.hackathon).populate('organizer', '_id name');
    if (!hackathon) {
      const error = new Error('Hackathon no longer exists');
      error.statusCode = 404;
      throw error;
    }

    const judge = await User.findById(userId).select('name email');

    // Move from pendingJudges → assignedJudges
    hackathon.pendingJudges = hackathon.pendingJudges.filter((j) => j.toString() !== userId.toString());
    if (!hackathon.assignedJudges.some((j) => j.toString() === userId.toString())) {
      hackathon.assignedJudges.push(userId);
    }
    await hackathon.save();

    // Mark notification as accepted
    notification.status = 'accepted';
    await notification.save();

    // Notify the organiser that the judge accepted
    await Notification.create({
      user: hackathon.organizer._id,
      sender: userId,
      type: 'hackathon',
      title: `Judge Accepted: ${hackathon.title}`,
      message: `${judge?.name || 'A judge'} has accepted your invitation to judge "${hackathon.title}" and now has access to the evaluation portal.`,
      hackathon: hackathon._id,
      status: 'read',
    });

    return { message: `You have accepted the judge invitation for "${hackathon.title}". You now have access to the evaluation portal.` };
  }

  /**
   * Reject a judge_invite notification — removes judge from pendingJudges
   * and notifies the organiser.
   */
  async rejectJudgeInvite(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
      type: 'judge_invite',
    });

    if (!notification) {
      const error = new Error('Judge invitation not found');
      error.statusCode = 404;
      throw error;
    }

    if (notification.status !== 'pending') {
      const error = new Error(`This invitation has already been ${notification.status}`);
      error.statusCode = 400;
      throw error;
    }

    const hackathon = await Hackathon.findById(notification.hackathon).populate('organizer', '_id name');
    if (!hackathon) {
      notification.status = 'rejected';
      await notification.save();
      return { message: 'Invitation declined.' };
    }

    const judge = await User.findById(userId).select('name email');

    // Remove from both pending and assigned (in case they were previously assigned)
    hackathon.pendingJudges = hackathon.pendingJudges.filter((j) => j.toString() !== userId.toString());
    hackathon.assignedJudges = hackathon.assignedJudges.filter((j) => j.toString() !== userId.toString());
    await hackathon.save();

    // Mark notification as rejected
    notification.status = 'rejected';
    await notification.save();

    // Notify the organiser that the judge declined
    await Notification.create({
      user: hackathon.organizer._id,
      sender: userId,
      type: 'hackathon',
      title: `Judge Declined: ${hackathon.title}`,
      message: `${judge?.name || 'A judge'} has declined your invitation to judge "${hackathon.title}" and has been automatically removed from the judge list.`,
      hackathon: hackathon._id,
      status: 'read',
    });

    return { message: `You have declined the judge invitation for "${hackathon.title}".` };
  }

  /**
   * Publish results & winners
   */
  async publishResults(id, winners, user) {
    const leaderboard = await this.getLeaderboard(id, true, user);
    if (!leaderboard.rankings.length) {
      const error = new Error('At least one judge evaluation is required before publishing results');
      error.statusCode = 400;
      throw error;
    }

    const hackathon = await Hackathon.findById(id);
    const positionLabels = ['1st Place Winner', '2nd Place Runner Up', '3rd Place Bronze'];
    hackathon.isResultsPublished = true;
    hackathon.resultStatus = 'published';
    hackathon.status = 'ended';
    // Winners are always derived from the calculated ranking, never selected manually.
    hackathon.winners = leaderboard.rankings.slice(0, 3).map((entry, index) => ({
      rank: index + 1,
      submission: entry.submissionId,
      prize: positionLabels[index],
    }));

    await hackathon.save();
    return await this.getHackathonById(id);
  }

  /**
   * Build rankings from the average score stored after judge evaluations.
   * Tied projects share a rank; the following rank reflects the tie position.
   */
  async getLeaderboard(id, includeUnpublished = false, user = null) {
    const hackathon = await Hackathon.findById(id).select('title organizer isResultsPublished winners');
    if (!hackathon) {
      const error = new Error('Hackathon not found');
      error.statusCode = 404;
      throw error;
    }

    if (includeUnpublished) {
      if (!user || (hackathon.organizer.toString() !== user.id && user.role !== 'admin')) {
        const error = new Error('Not authorized to preview this leaderboard');
        error.statusCode = 403;
        throw error;
      }
    } else if (!hackathon.isResultsPublished) {
      const error = new Error('Rankings will be available once the organizer publishes the results');
      error.statusCode = 403;
      throw error;
    }

    const winnerPositions = new Map(
      (hackathon.winners || [])
        .filter((winner) => winner.submission)
        .map((winner) => [winner.submission.toString(), winner])
    );
    const submissions = await Submission.find({ hackathon: id, status: 'submitted', 'evaluations.0': { $exists: true } })
      .populate('team', 'name')
      .populate('submittedBy', 'name')
      .sort({ score: -1, _id: 1 })
      .lean();

    let previousScore = null;
    let previousRank = 0;
    const rankings = submissions.map((submission, index) => {
      const totalScore = Number((submission.score || 0).toFixed(2));
      const rank = previousScore !== null && totalScore === previousScore ? previousRank : index + 1;
      previousScore = totalScore;
      previousRank = rank;
      const winner = winnerPositions.get(submission._id.toString());
      return {
        rank,
        teamName: submission.team?.name || submission.submittedBy?.name || 'Individual Entry',
        projectName: submission.title,
        totalScore,
        maxScore: 40,
        position: winner?.prize || null,
        isWinner: Boolean(winner),
        submissionId: submission._id,
      };
    });

    return {
      hackathon: { id: hackathon._id, title: hackathon.title, isResultsPublished: hackathon.isResultsPublished },
      rankings,
    };
  }

  /**
   * Get registered teams for hackathon
   */
  async getHackathonTeams(id) {
    return await Team.find({ hackathon: id })
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });
  }

  /**
   * Get individually registered (solo) participants for a hackathon.
   * Excludes users who are part of a team (team-registered participants).
   */
  async getHackathonParticipants(id) {
    // Find all users who are in a team for this hackathon
    const teams = await Team.find({ hackathon: id }).select('members leader');
    const teamMemberIds = new Set();
    teams.forEach((t) => {
      if (t.leader) teamMemberIds.add(t.leader.toString());
      (t.members || []).forEach((m) => teamMemberIds.add(m.toString()));
    });

    // Fetch all active registrations for this hackathon
    const registrations = await Registration.find({ hackathon: id, status: 'active' })
      .populate('participant', 'name email avatar skills bio')
      .sort({ registeredAt: -1 });

    // Filter to only solo participants (not in any team)
    const soloRegistrations = registrations.filter(
      (r) => r.participant && !teamMemberIds.has(r.participant._id.toString())
    );

    return soloRegistrations;
  }

  /**
   * Update team status (approve / reject)
   */
  async updateTeamStatus(teamId, status, user) {
    const team = await Team.findById(teamId)
      .populate('hackathon')
      .populate('leader', 'name email')
      .populate('members', 'name email');

    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }

    if (team.hackathon.organizer.toString() !== user.id && user.role !== 'admin') {
      const error = new Error('Not authorized to modify team status for this hackathon');
      error.statusCode = 403;
      throw error;
    }

    // Rule: Once approved, host CANNOT disapprove or reject again
    if (team.status === 'approved' && status !== 'approved') {
      const error = new Error('Team has already been approved and cannot be disapproved or rejected.');
      error.statusCode = 400;
      throw error;
    }

    const prevStatus = team.status;
    team.status = status;
    await team.save();

    // Send notifications to all team members when status changes
    if (status === 'approved' && prevStatus !== 'approved') {
      const Notification = require('../models/Notification');
      const leaderIdStr = team.leader?._id ? team.leader._id.toString() : team.leader.toString();
      const memberIdsStr = (team.members || []).map((m) => (m._id ? m._id.toString() : m.toString()));
      const allMemberIds = Array.from(new Set([leaderIdStr, ...memberIdsStr]));

      for (const memberId of allMemberIds) {
        await Notification.create({
          user: memberId,
          sender: user.id,
          type: 'hackathon',
          title: `Team Approved: ${team.name}`,
          message: `Your team "${team.name}" has been approved by the host for "${team.hackathon?.title || 'the hackathon'}"! 🎉 You are officially ready to participate.`,
          team: team._id,
          hackathon: team.hackathon?._id || team.hackathon,
          status: 'read',
        });
      }
    } else if (status === 'rejected' && prevStatus !== 'rejected') {
      const Notification = require('../models/Notification');
      const leaderIdStr = team.leader?._id ? team.leader._id.toString() : team.leader.toString();
      const memberIdsStr = (team.members || []).map((m) => (m._id ? m._id.toString() : m.toString()));
      const allMemberIds = Array.from(new Set([leaderIdStr, ...memberIdsStr]));

      for (const memberId of allMemberIds) {
        await Notification.create({
          user: memberId,
          sender: user.id,
          type: 'hackathon',
          title: `Team Request Status: ${team.name}`,
          message: `Your team "${team.name}" request for "${team.hackathon?.title || 'the hackathon'}" was rejected by the host.`,
          team: team._id,
          hackathon: team.hackathon?._id || team.hackathon,
          status: 'read',
        });
      }
    }

    return team;
  }

  /**
   * Get all submissions for a hackathon
   */
  async getHackathonSubmissions(id) {
    return await Submission.find({ hackathon: id })
      .populate('submittedBy', 'name email avatar')
      .populate('teamMembers', 'name email')
      .sort({ score: -1, createdAt: -1 });
  }

  /**
   * Get full hackathon context for the assigned judge:
   * hackathon details, teams, solo participants, and submissions.
   */
  async getJudgeView(id, userId, userRole) {
    const hackathon = await Hackathon.findById(id)
      .populate('organizer', 'name email avatar')
      .populate('assignedJudges', 'name email avatar')
      .populate('pendingJudges', 'name email avatar')
      .lean();

    if (!hackathon) {
      const error = new Error('Hackathon not found');
      error.statusCode = 404;
      throw error;
    }

    // Only the assigned judge (or admin) may access this view
    const isAdmin = userRole === 'admin';
    const isAssigned = hackathon.assignedJudges.some(
      (j) => (j._id || j).toString() === userId.toString()
    );
    if (!isAdmin && !isAssigned) {
      const error = new Error('You are not the assigned judge for this hackathon');
      error.statusCode = 403;
      throw error;
    }

    // Teams with members
    const teams = await Team.find({ hackathon: id })
      .populate('leader', 'name email avatar')
      .populate('members', 'name email avatar skills')
      .lean();

    // Solo participants (registered but not in any team)
    const teamMemberIds = new Set();
    teams.forEach((t) => {
      if (t.leader) teamMemberIds.add((t.leader._id || t.leader).toString());
      (t.members || []).forEach((m) => teamMemberIds.add((m._id || m).toString()));
    });

    const registrations = await Registration.find({ hackathon: id, status: 'active' })
      .populate('participant', 'name email avatar skills bio')
      .lean();

    const soloParticipants = registrations.filter(
      (r) => r.participant && !teamMemberIds.has((r.participant._id || r.participant).toString())
    );

    // Submissions with evaluation state
    const submissions = await Submission.find({ hackathon: id, status: 'submitted' })
      .populate('submittedBy', 'name email avatar')
      .populate('team', 'name')
      .populate('teamMembers', 'name email avatar')
      .sort({ score: -1, createdAt: -1 })
      .lean();

    const stats = await this.getParticipantStats(id);

    return {
      hackathon: { ...hackathon, ...stats },
      teams,
      soloParticipants,
      submissions,
    };
  }
}

module.exports = new HackathonService();
