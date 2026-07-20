const Review = require('../models/review.model');
const Submission = require('../models/submission.model');
const Hackathon = require('../models/hackathon.model');
const APIError = require('../utils/apiError');
const mongoose = require('mongoose');

const submitReview = async (judgeId, submissionId, { scores, feedback }) => {
  // 1. Find submission
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw new APIError('Submission not found', 404);
  }

  // 2. Find hackathon to check if user is an assigned judge
  const hack = await Hackathon.findById(submission.hackathon);
  if (!hack) {
    throw new APIError('Associated hackathon not found', 404);
  }

  const isAssignedJudge = hack.judges.some(j => j.toString() === judgeId.toString());
  if (!isAssignedJudge) {
    throw new APIError('Not authorized as an assigned judge for this hackathon', 403);
  }

  // 3. Create or update review (upsert)
  const query = { submission: submissionId, judge: judgeId };
  const updateData = {
    scores,
    feedback,
  };

  // We find one and save to trigger the pre-save totalScore calculation hook
  let review = await Review.findOne(query);
  if (review) {
    review.scores = scores;
    review.feedback = feedback;
  } else {
    review = new Review({
      submission: submissionId,
      judge: judgeId,
      scores,
      feedback,
    });
  }

  await review.save();
  return review;
};

const getSubmissionReviews = async (submissionId) => {
  return await Review.find({ submission: submissionId })
    .populate('judge', 'name email profileImage');
};

const getLeaderboard = async (hackathonId) => {
  const ObjectId = mongoose.Types.ObjectId;

  const leaderboard = await Submission.aggregate([
    { $match: { hackathon: new ObjectId(hackathonId) } },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'submission',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        // Default to 0 if no reviews exist yet
        averageScore: {
          $cond: {
            if: { $gt: [{ $size: '$reviews' }, 0] },
            then: { $avg: '$reviews.totalScore' },
            else: 0,
          },
        },
        reviewCount: { $size: '$reviews' },
        avgInnovation: { $avg: '$reviews.scores.innovation' },
        avgTechnical: { $avg: '$reviews.scores.technicalComplexity' },
        avgDesign: { $avg: '$reviews.scores.design' },
        avgPresentation: { $avg: '$reviews.scores.presentation' },
      },
    },
    {
      $lookup: {
        from: 'teams',
        localField: 'team',
        foreignField: '_id',
        as: 'teamDetails',
      },
    },
    { $unwind: { path: '$teamDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        projectName: 1,
        projectDescription: 1,
        repositoryUrl: 1,
        demoUrl: 1,
        averageScore: 1,
        reviewCount: 1,
        avgInnovation: 1,
        avgTechnical: 1,
        avgDesign: 1,
        avgPresentation: 1,
        team: {
          _id: '$teamDetails._id',
          name: '$teamDetails.name',
        },
      },
    },
    { $sort: { averageScore: -1, reviewCount: -1 } },
  ]);

  return leaderboard;
};

const getJudgeReviews = async (judgeId) => {
  return await Review.find({ judge: judgeId })
    .populate({
      path: 'submission',
      populate: [
        { path: 'hackathon', select: 'title' },
        { path: 'team', select: 'name' }
      ]
    });
};

module.exports = {
  submitReview,
  getSubmissionReviews,
  getLeaderboard,
  getJudgeReviews,
};
