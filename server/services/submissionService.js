const Submission = require('../models/Submission');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');

class SubmissionService {
  /**
   * Create or update project submission
   */
  async submitProject(data, files, userId) {
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

    // Deadline check: editing/submitting is allowed before deadline only
    const now = new Date();
    if (hackathon.endDate && now > new Date(hackathon.endDate)) {
      const error = new Error('Submissions are closed. The hackathon deadline has passed.');
      error.statusCode = 400;
      throw error;
    }

    // Check if user is in a team for this hackathon
    const userTeam = await Team.findOne({
      hackathon: hackathonId,
      $or: [{ leader: userId }, { members: userId }],
    });

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
   * Public showcase list of submissions
   */
  async getAllSubmissions({ search = '', hackathonId = '', page = 1, limit = 12 }) {
    const query = { status: 'submitted' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (hackathonId) {
      query.hackathon = hackathonId;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const submissions = await Submission.find(query)
      .populate('hackathon', 'title status prizePool')
      .populate('submittedBy', 'name email avatar')
      .populate('team', 'name')
      .populate('teamMembers', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Submission.countDocuments(query);
    const pages = Math.ceil(total / parseInt(limit, 10)) || 1;

    return {
      submissions,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages,
        limit: parseInt(limit, 10),
      },
    };
  }

  /**
   * Delete submission
   */
  async deleteSubmission(id, userId, userRole) {
    const submission = await Submission.findById(id).populate('hackathon');
    if (!submission) {
      const error = new Error('Submission not found');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = submission.submittedBy.toString() === userId.toString();
    const isTeamMember = submission.teamMembers.some((m) => m.toString() === userId.toString());

    if (!isOwner && !isTeamMember && userRole !== 'admin') {
      const error = new Error('Not authorized to delete this submission');
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
}

module.exports = new SubmissionService();
