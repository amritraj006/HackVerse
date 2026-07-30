const Submission = require('../models/Submission');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const Registration = require('../models/Registration');
const mongoose = require('mongoose');

const JUDGING_CRITERIA = [
  { criterion: 'Innovation', maxScore: 10 },
  { criterion: 'Technical Implementation', maxScore: 10 },
  { criterion: 'Impact & Usefulness', maxScore: 10 },
  { criterion: 'Presentation', maxScore: 10 },
];

class SubmissionService {
  /**
   * Create or update project submission
   */
  async submitProject(data, files, userId, userRole) {
    // 1. Role restriction: Hosts (organizers), Judges, and Admins cannot submit projects
    if (userRole && ['organizer', 'judge', 'admin'].includes(userRole)) {
      const error = new Error('Organizers, judges, and admins cannot submit projects.');
      error.statusCode = 403;
      throw error;
    }

    const { hackathonId, title, tagline, description, repositoryUrl, demoUrl, videoUrl, status } = data;

    if (!hackathonId) {
      const error = new Error('Hackathon ID is required');
      error.statusCode = 400;
      throw error;
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      const error = new Error('Hackathon not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Must be registered for the hackathon
    const registration = await Registration.findOne({
      hackathon: hackathonId,
      participant: userId,
      status: 'active',
    });

    if (!registration) {
      const error = new Error('Only registered participants can submit a project for this hackathon.');
      error.statusCode = 403;
      throw error;
    }

    // Deadline check: editing/submitting is allowed before deadline only
    const now = new Date();
    if (hackathon.endDate && now > new Date(hackathon.endDate)) {
      const error = new Error('Submissions are closed. The hackathon deadline has passed.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Check if user is in a team for this hackathon
    const userTeam = await Team.findOne({
      hackathon: hackathonId,
      $or: [{ leader: userId }, { members: userId }],
    });

    if (userTeam) {
      // User is in a team: only the team creator (leader) can submit or edit the project
      const isLeader = userTeam.leader.toString() === userId.toString();
      if (!isLeader) {
        const error = new Error('Only the team creator (leader) can submit or edit project submissions for a team. Team members cannot submit projects.');
        error.statusCode = 403;
        throw error;
      }
    }

    let teamId = userTeam ? userTeam._id : null;
    let membersList = userTeam ? userTeam.members : [userId];

    // Check existing submission by team or user
    let existingSubmission = null;
    if (teamId) {
      existingSubmission = await Submission.findOne({ hackathon: hackathonId, team: teamId });
    } else {
      existingSubmission = await Submission.findOne({ hackathon: hackathonId, submittedBy: userId });
    }

    // File processing
    let presentationFilePath = existingSubmission ? existingSubmission.presentationFile : '';
    if (files && files.presentationFile && files.presentationFile[0]) {
      presentationFilePath = `/uploads/${files.presentationFile[0].filename}`;
    }

    let screenshotPaths = existingSubmission ? [...(existingSubmission.screenshots || [])] : [];
    if (files && files.screenshots && files.screenshots.length > 0) {
      const newScreenshots = files.screenshots.map((file) => `/uploads/${file.filename}`);
      screenshotPaths = [...screenshotPaths, ...newScreenshots];
    }

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.title = title !== undefined ? title : existingSubmission.title;
      existingSubmission.tagline = tagline !== undefined ? tagline : existingSubmission.tagline;
      existingSubmission.description = description !== undefined ? description : existingSubmission.description;
      existingSubmission.repositoryUrl = repositoryUrl !== undefined ? repositoryUrl : existingSubmission.repositoryUrl;
      existingSubmission.demoUrl = demoUrl !== undefined ? demoUrl : existingSubmission.demoUrl;
      existingSubmission.videoUrl = videoUrl !== undefined ? videoUrl : existingSubmission.videoUrl;
      existingSubmission.status = status || existingSubmission.status;
      existingSubmission.presentationFile = presentationFilePath;
      existingSubmission.screenshots = screenshotPaths;
      existingSubmission.teamMembers = membersList;

      await existingSubmission.save();

      return await Submission.findById(existingSubmission._id)
        .populate('hackathon', 'title status endDate')
        .populate('submittedBy', 'name email avatar')
        .populate('team', 'name joinCode')
        .populate('teamMembers', 'name email avatar');
    }

    // Create new submission
    const newSubmission = await Submission.create({
      hackathon: hackathonId,
      team: teamId,
      submittedBy: userId,
      teamMembers: membersList,
      title,
      tagline: tagline || '',
      description,
      repositoryUrl: repositoryUrl || '',
      demoUrl: demoUrl || '',
      videoUrl: videoUrl || '',
      presentationFile: presentationFilePath,
      screenshots: screenshotPaths,
      status: status || 'submitted',
    });

    return await Submission.findById(newSubmission._id)
      .populate('hackathon', 'title status endDate')
      .populate('submittedBy', 'name email avatar')
      .populate('team', 'name joinCode')
      .populate('teamMembers', 'name email avatar');
  }

  /**
   * Get single submission by ID
   */
  async getSubmissionById(id) {
    const submission = await Submission.findById(id)
      .populate('hackathon', 'title status startDate endDate prizePool')
      .populate('submittedBy', 'name email avatar')
      .populate('team', 'name joinCode')
      .populate('teamMembers', 'name email avatar skills')
      .populate('evaluations.judge', 'name email');

    if (!submission) {
      const error = new Error('Submission not found');
      error.statusCode = 404;
      throw error;
    }

    return submission;
  }

  /**
   * Get logged-in user's submissions
   */
  async getMySubmissions(userId) {
    return await Submission.find({
      $or: [{ submittedBy: userId }, { teamMembers: userId }],
    })
      .populate('hackathon', 'title status startDate endDate prizePool')
      .populate('submittedBy', 'name email avatar')
      .populate('team', 'name')
      .populate('teamMembers', 'name email avatar')
      .sort({ createdAt: -1 });
  }

  /**
   * Get submissions for a hackathon
   */
  async getHackathonSubmissions(hackathonId) {
    return await Submission.find({ hackathon: hackathonId })
      .populate('submittedBy', 'name email avatar')
      .populate('team', 'name')
      .populate('teamMembers', 'name email avatar')
      .sort({ createdAt: -1 });
  }

  /**
   * Get the submitted projects and assigned hackathons for a judge.
   */
  async getAssignedSubmissions(userId, userRole) {
    const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const hackathonQuery = userRole === 'admin' ? {} : { assignedJudges: { $in: [userId, userObjId] } };

    const assignedHackathons = await Hackathon.find(hackathonQuery)
      .populate('organizer', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    const hackathonIds = assignedHackathons.map((h) => h._id);

    const submissions = await Submission.find({
      hackathon: { $in: hackathonIds },
      status: 'submitted',
    })
      .populate('hackathon', 'title status endDate')
      .populate('submittedBy', 'name email avatar')
      .populate('team', 'name')
      .populate('teamMembers', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    return {
      criteria: JUDGING_CRITERIA,
      assignedHackathons,
      submissions: submissions.map((submission) => ({
        ...submission,
        myEvaluation: submission.evaluations?.find((evaluation) => evaluation.judge?.toString() === userId.toString()) || null,
      })),
    };
  }


  /**
   * Save an evaluation once. The conditional update makes duplicate submissions
   * impossible even when two requests are sent at the same time.
   */
  async submitEvaluation(submissionId, data, user) {
    const submission = await Submission.findById(submissionId).select('hackathon');
    if (!submission) {
      const error = new Error('Submission not found');
      error.statusCode = 404;
      throw error;
    }

    const isAdmin = user.role === 'admin';
    const isAssigned = isAdmin || await Hackathon.exists({ _id: submission.hackathon, assignedJudges: user.id });
    if (!isAssigned) {
      const error = new Error('You are not assigned to evaluate this project');
      error.statusCode = 403;
      throw error;
    }

    const suppliedScores = data.criteriaScores;
    if (!Array.isArray(suppliedScores) || suppliedScores.length !== JUDGING_CRITERIA.length) {
      const error = new Error('A score is required for every judging criterion');
      error.statusCode = 400;
      throw error;
    }

    const scoreByCriterion = new Map(suppliedScores.map((item) => [item.criterion, Number(item.score)]));
    const criteriaScores = JUDGING_CRITERIA.map(({ criterion, maxScore }) => {
      const score = scoreByCriterion.get(criterion);
      if (!Number.isFinite(score) || score < 0 || score > maxScore) {
        const error = new Error(`${criterion} must be a number between 0 and ${maxScore}`);
        error.statusCode = 400;
        throw error;
      }
      return { criterion, score, maxScore };
    });
    const totalScore = criteriaScores.reduce((total, item) => total + item.score, 0);
    const judgeId = new mongoose.Types.ObjectId(user.id);
    const feedback = typeof data.feedback === 'string' ? data.feedback.trim() : '';
    if (!feedback) {
      const error = new Error('Feedback is required');
      error.statusCode = 400;
      throw error;
    }

    // First stage appends only when no review exists; second stage recalculates
    // the public score as the average of all submitted judge totals.
    const updated = await Submission.findOneAndUpdate(
      { _id: submissionId, 'evaluations.judge': { $ne: judgeId } },
      [
        {
          $set: {
            evaluations: {
              $concatArrays: [
                '$evaluations',
                [{ judge: judgeId, score: totalScore, criteriaScores, feedback, evaluatedAt: new Date() }],
              ],
            },
          },
        },
        { $set: { score: { $avg: '$evaluations.score' } } },
      ],
      { new: true }
    )
      .populate('hackathon', 'title status endDate')
      .populate('submittedBy', 'name email avatar')
      .populate('team', 'name');

    if (!updated) {
      const error = new Error('You have already submitted an evaluation for this project');
      error.statusCode = 409;
      throw error;
    }

    return updated;
  }

  /**
   * Public showcase list of submissions
   */
  async getAllSubmissions(params = {}) {
    const {
      search = '',
      hackathonId = '',
      status = 'submitted',
      sortBy = 'createdAt',
      order = 'desc',
      minScore,
      maxScore,
      page = 1,
      limit = 12,
    } = params;

    const query = {};
    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { tagline: searchRegex },
        { description: searchRegex },
      ];
    }

    if (hackathonId) {
      query.hackathon = hackathonId;
    }

    if (minScore !== undefined || maxScore !== undefined) {
      query.score = {};
      if (minScore !== undefined && minScore !== '') query.score.$gte = Number(minScore);
      if (maxScore !== undefined && maxScore !== '') query.score.$lte = Number(maxScore);
    }

    const sortOrder = order === 'asc' || order === '1' ? 1 : -1;
    const sortObj = {};
    const validSortFields = ['createdAt', 'score', 'title'];
    if (validSortFields.includes(sortBy)) {
      sortObj[sortBy] = sortOrder;
    } else {
      sortObj.createdAt = -1;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const submissions = await Submission.find(query)
      .populate('hackathon', 'title status prizePool')
      .populate('submittedBy', 'name email avatar')
      .populate('team', 'name')
      .populate('teamMembers', 'name email avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Submission.countDocuments(query);
    const pages = Math.ceil(total / limitNum) || 1;

    return {
      submissions,
      pagination: {
        total,
        page: pageNum,
        pages,
        limit: limitNum,
      },
    };
  }


  /**
   * Delete submission
   */
  async deleteSubmission(id, userId, userRole) {
    const submission = await Submission.findById(id).populate('hackathon').populate('team');
    if (!submission) {
      const error = new Error('Submission not found');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = submission.submittedBy.toString() === userId.toString();
    const isTeamLeader = submission.team ? submission.team.leader?.toString() === userId.toString() : false;

    if (!isOwner && !isTeamLeader && userRole !== 'admin') {
      const error = new Error('Only team creators or solo participants can delete this project submission');
      error.statusCode = 403;
      throw error;
    }

    // Check deadline
    if (userRole !== 'admin' && submission.hackathon?.endDate && new Date() > new Date(submission.hackathon.endDate)) {
      const error = new Error('Cannot delete submission after the hackathon deadline');
      error.statusCode = 400;
      throw error;
    }

    await Submission.findByIdAndDelete(id);
    return { message: 'Submission deleted successfully' };
  }

  /**
   * Declare a submission as the winner of its hackathon.
   * - Flags the submission with isWinner = true and a position label.
   * - Adds a win entry to every User involved (team members or solo participant).
   * - Clears the isWinner flag from any previously declared winner for the same hackathon.
   */
  async declareWinner(submissionId, userId, userRole) {
    const User = require('../models/User');

    const submission = await Submission.findById(submissionId)
      .populate('team', 'name leader members')
      .populate('teamMembers', '_id name')
      .populate('submittedBy', '_id name');

    if (!submission) {
      const error = new Error('Submission not found');
      error.statusCode = 404;
      throw error;
    }

    // Only the assigned judge (or admin) may declare a winner
    const isAdmin = userRole === 'admin';
    const isAssigned = isAdmin || await Hackathon.exists({ _id: submission.hackathon, assignedJudges: userId });
    if (!isAssigned) {
      const error = new Error('Only the assigned judge can declare a winner');
      error.statusCode = 403;
      throw error;
    }

    // Clear previous winner flag for this hackathon (one winner per hackathon)
    await Submission.updateMany(
      { hackathon: submission.hackathon, isWinner: true },
      { $set: { isWinner: false, winnerPosition: '' } }
    );

    // Mark this submission as winner
    submission.isWinner = true;
    submission.winnerPosition = '1st Place Winner';
    await submission.save();

    // Collect all user IDs affected by this win
    const winnerUserIds = new Set();
    if (submission.team) {
      // Team submission — credit leader + all members
      if (submission.team.leader) winnerUserIds.add(submission.team.leader.toString());
      (submission.team.members || []).forEach((m) => winnerUserIds.add((m._id || m).toString()));
    } else {
      // Solo submission — credit the submitter
      winnerUserIds.add(submission.submittedBy._id.toString());
    }

    // Remove any previous win for this hackathon from affected users
    await User.updateMany(
      { 'wins.hackathon': submission.hackathon },
      { $pull: { wins: { hackathon: submission.hackathon } } }
    );

    // Push the new win entry to all winning users
    await User.updateMany(
      { _id: { $in: [...winnerUserIds] } },
      {
        $push: {
          wins: {
            hackathon: submission.hackathon,
            submission: submission._id,
            position: '1st Place Winner',
          },
        },
      }
    );

    return await Submission.findById(submissionId)
      .populate('hackathon', 'title status')
      .populate('submittedBy', 'name email avatar')
      .populate('team', 'name')
      .populate('teamMembers', 'name email avatar');
  }
}

module.exports = new SubmissionService();
