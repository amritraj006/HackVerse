const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, 'Validation failed', errors.array());
  }
  next();
};

const createHackathonValidationRules = [
  body('title').notEmpty().withMessage('Hackathon title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('registrationDeadline')
    .isISO8601()
    .withMessage('Valid registration deadline is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required')
    .custom((value, { req }) => {
      if (req.body.registrationDeadline && new Date(value) <= new Date(req.body.registrationDeadline)) {
        throw new Error('Start date must be after the registration deadline');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date is required')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after the start date');
      }
      return true;
    }),
  validate,
];

module.exports = {
  createHackathonValidationRules,
};
