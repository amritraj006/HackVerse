const User = require('../models/user.model');
const Hackathon = require('../models/hackathon.model');
const Team = require('../models/team.model');
const Registration = require('../models/registration.model');
const Submission = require('../models/submission.model');
const Review = require('../models/review.model');
const { ROLES, HACKATHON_STATUS } = require('../constants/roles');

const getAdminStats = async () => {
  // Aggregate user counts by role
  const userCounts = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
  const roleStats = { admin: 0, organizer: 0, participant: 0, judge: 0 };
  userCounts.forEach(c => {
    roleStats[c._id] = c.count;
  });

  // Aggregate hackathon counts by status
  const hackathonCounts = await Hackathon.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const statusStats = { upcoming: 0, ongoing: 0, completed: 0 };
  hackathonCounts.forEach(h => {
    statusStats[h._id] = h.count;
  });

  const totalTeams = await Team.countDocuments();
  const totalSubmissions = await Submission.countDocuments();
  const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);
  const hackathons = await Hackathon.find().populate('organizer', 'name email').sort({ createdAt: -1 }).limit(5);

  return {
    users: roleStats,
    hackathons: statusStats,
    totalTeams,
    totalSubmissions,
    recentUsers,
    recentHackathons: hackathons
  };
};

const getOrganizerStats = async (organizerId) => {
  const hackathons = await Hackathon.find({ organizer: organizerId }).sort({ createdAt: -1 });
  const hackathonIds = hackathons.map(h => h._id);

  // Stats across all owned hackathons
  const registrationsCount = await Registration.countDocuments({
    hackathon: { $in: hackathonIds }
  });
  
  const submissionsCount = await Submission.countDocuments({
    hackathon: { $in: hackathonIds }
  });

  const teamsCount = await Team.countDocuments({
    hackathon: { $in: hackathonIds }
  });

  return {
    hackathonsCount: hackathons.length,
    registrationsCount,
    submissionsCount,
    teamsCount,
    hackathonsList: hackathons,
  };
};

const getParticipantStats = async (participantId) => {
  // Find all registrations for this user
  const registrations = await Registration.find({ user: participantId })
    .populate({
      path: 'hackathon',
      select: 'title startDate endDate status theme bannerImage mode registrationDeadline'
    })
    .populate('team', 'name inviteCode members leader')
    .sort({ registeredAt: -1 });

  const activeRegistrations = registrations.filter(r => r.status === 'registered');

  // For each registered hackathon, check if they have submitted
  const registrationsWithSubmission = await Promise.all(
    activeRegistrations.map(async (reg) => {
      let submission = null;
      if (reg.team) {
        submission = await Submission.findOne({ team: reg.team._id, hackathon: reg.hackathon._id });
      }
      return {
        registration: reg,
        submission: submission ? {
          _id: submission._id,
          projectName: submission.projectName,
          submittedAt: submission.createdAt
        } : null
      };
    })
  );

  return {
    registrations: registrationsWithSubmission,
  };
};

const getJudgeStats = async (judgeId) => {
  // Find all hackathons where this user is assigned as a judge
  const hackathons = await Hackathon.find({ judges: judgeId }).select('title startDate endDate status');
  const hackathonIds = hackathons.map(h => h._id);

  // Submissions associated with these hackathons
  const submissions = await Submission.find({ hackathon: { $in: hackathonIds } })
    .populate('hackathon', 'title')
    .populate('team', 'name');

  // Reviews written by this judge
  const reviews = await Review.find({ judge: judgeId });
  const reviewedSubmissionIds = reviews.map(r => r.submission.toString());

  const pendingSubmissions = [];
  const completedSubmissions = [];

  submissions.forEach(sub => {
    const isReviewed = reviewedSubmissionIds.includes(sub._id.toString());
    const review = reviews.find(r => r.submission.toString() === sub._id.toString());
    const item = {
      submission: sub,
      review: review || null
    };
    if (isReviewed) {
      completedSubmissions.push(item);
    } else {
      pendingSubmissions.push(item);
    }
  });

  return {
    hackathonsCount: hackathons.length,
    pendingReviewsCount: pendingSubmissions.length,
    completedReviewsCount: completedSubmissions.length,
    pendingSubmissions,
    completedSubmissions,
    hackathons,
  };
};

module.exports = {
  getAdminStats,
  getOrganizerStats,
  getParticipantStats,
  getJudgeStats,
};
