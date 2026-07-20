const reviewService = require('../services/review.service');
const APIResponse = require('../utils/apiResponse');

const submitReview = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const review = await reviewService.submitReview(req.user._id, submissionId, req.body);
    res.status(200).json(new APIResponse(200, { review }, 'Review submitted successfully'));
  } catch (error) {
    next(error);
  }
};

const getSubmissionReviews = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const reviews = await reviewService.getSubmissionReviews(submissionId);
    res.status(200).json(new APIResponse(200, { reviews }, 'Reviews retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;
    const leaderboard = await reviewService.getLeaderboard(hackathonId);
    res.status(200).json(new APIResponse(200, { leaderboard }, 'Leaderboard retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getJudgeReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getJudgeReviews(req.user._id);
    res.status(200).json(new APIResponse(200, { reviews }, 'Judge reviews retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReview,
  getSubmissionReviews,
  getLeaderboard,
  getJudgeReviews,
};
