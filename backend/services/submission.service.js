const Submission = require('../models/submission.model');
const Team = require('../models/team.model');
const Hackathon = require('../models/hackathon.model');
const APIError = require('../utils/apiError');

const createOrUpdateSubmission = async (userId, {
  hackathonId,
  projectName,
  projectDescription,
  repositoryUrl,
  demoUrl,
  presentationPdf,
  screenshots,
}) => {
  // 1. Find user's team for this hackathon
  const team = await Team.findOne({
    hackathon: hackathonId,
    $or: [{ leader: userId }, { members: userId }],
  });

  if (!team) {
    throw new APIError('You must be part of a registered team to submit a project', 400);
  }

  // 2. Find hackathon to check constraints
  const hack = await Hackathon.findById(hackathonId);
  if (!hack) {
    throw new APIError('Hackathon not found', 404);
  }

  // 3. Verify team size
  if (team.members.length < hack.minTeamSize) {
    throw new APIError(`Your team size (${team.members.length}) is below the minimum required size (${hack.minTeamSize})`, 400);
  }

  // 4. Check timeline
  const now = new Date();
  if (now < new Date(hack.startDate)) {
    throw new APIError('Submission portal is not open yet (Hackathon has not started)', 400);
  }
  if (now > new Date(hack.endDate)) {
    throw new APIError('Submission portal is closed (Hackathon has ended)', 400);
  }

  // 5. Create or Update submission (Upsert based on hackathon + team)
  const query = { hackathon: hackathonId, team: team._id };
  const updateData = {
    submittedBy: userId,
    projectName,
    projectDescription,
    repositoryUrl,
    demoUrl,
  };

  if (presentationPdf) {
    updateData.presentationPdf = presentationPdf;
  }
  if (screenshots && screenshots.length > 0) {
    updateData.screenshots = screenshots;
  }

  const submission = await Submission.findOneAndUpdate(query, updateData, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  return submission;
};

const getSubmissionDetails = async (id) => {
  const submission = await Submission.findById(id)
    .populate('hackathon', 'title status endDate')
    .populate('team', 'name leader members')
    .populate('submittedBy', 'name email');

  if (!submission) {
    throw new APIError('Submission not found', 404);
  }

  return submission;
};

const getTeamSubmission = async (teamId) => {
  return await Submission.findOne({ team: teamId });
};

const getHackathonSubmissions = async (hackathonId) => {
  return await Submission.find({ hackathon: hackathonId })
    .populate('team', 'name leader members')
    .populate('submittedBy', 'name email');
};

module.exports = {
  createOrUpdateSubmission,
  getSubmissionDetails,
  getTeamSubmission,
  getHackathonSubmissions,
};
