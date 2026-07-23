const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const User = require('../models/User');

class HackathonService {
  /**
   * Get all public hackathons
   */
  async getAllHackathons(params = {}) {
    const { search = '', status = '', page = 1, limit = 10 } = params;
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const hackathons = await Hackathon.find(query)
      .populate('organizer', 'name email avatar')
      .populate('assignedJudges', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Hackathon.countDocuments(query);
    const pages = Math.ceil(total / parseInt(limit, 10)) || 1;

    return {
      hackathons,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages,
        limit: parseInt(limit, 10),
      },
    };
  }

  /**
   * Get single hackathon details
   */
  async getHackathonById(id) {
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
    return hackathon;
  }

  /**
   * Get events created by logged-in organizer
   */
  async getMyEvents(organizerId) {
    return await Hackathon.find({ organizer: organizerId })
      .populate('assignedJudges', 'name email')
      .sort({ createdAt: -1 });
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

    const hackathon = await Hackathon.create({
      title,
      description,
      tagline: tagline || '',
      organizer: organizerId,
      startDate,
      endDate,
      registrationDeadline,
      maxTeamSize: maxTeamSize || 4,
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

    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    Object.assign(hackathon, data);
    await hackathon.save();
    return hackathon;
  }

  /**
   * Delete hackathon (Organizer ownership check)
   */
  async deleteHackathon(id, user) {
    const hackathon = await Hackathon.findById(id);
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

    await Hackathon.findByIdAndDelete(id);
    return { id, message: 'Hackathon deleted successfully' };
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

    hackathon.isRegistrationOpen = isOpen !== undefined ? isOpen : !hackathon.isRegistrationOpen;
    await hackathon.save();
    return hackathon;
  }

  /**
   * Assign judges to hackathon
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

    // Verify all IDs belong to judges
    const validJudges = await User.find({ _id: { $in: judgeIds }, role: { $in: ['judge', 'admin'] } });
    hackathon.assignedJudges = validJudges.map((j) => j._id);
    await hackathon.save();

    return await Hackathon.findById(id).populate('assignedJudges', 'name email avatar skills');
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
   * Update team status (approve / reject)
   */
  async updateTeamStatus(teamId, status, user) {
    const team = await Team.findById(teamId).populate('hackathon');
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

    team.status = status;
    await team.save();
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
}

module.exports = new HackathonService();
