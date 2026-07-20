const express = require('express');
const reviewController = require('../controllers/review.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createReviewSchema } = require('../validations/review.validation');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.post(
  '/submission/:submissionId',
  protect,
  authorizeRoles(ROLES.JUDGE, ROLES.ADMIN),
  validate(createReviewSchema),
  reviewController.submitReview
);

router.get(
  '/submission/:submissionId',
  protect,
  authorizeRoles(ROLES.ORGANIZER, ROLES.JUDGE, ROLES.ADMIN),
  reviewController.getSubmissionReviews
);

router.get(
  '/judge',
  protect,
  authorizeRoles(ROLES.JUDGE, ROLES.ADMIN),
  reviewController.getJudgeReviews
);

router.get('/leaderboard/:hackathonId', protect, reviewController.getLeaderboard);

module.exports = router;
