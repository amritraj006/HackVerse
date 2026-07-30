const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return errorResponse(res, 400, 'Validation failed', formattedErrors);
  }
  next();
};

const createTeamValidationRules = [
  body('hackathonId')
    .notEmpty()
    .withMessage('Hackathon ID is required')
    .isMongoId()
    .withMessage('Invalid Hackathon ID format'),
  body('name').trim().notEmpty().withMessage('Team name is required'),
  validate,
];

const joinTeamValidationRules = [
  body('joinCode').trim().notEmpty().withMessage('Join code is required'),
  validate,
];

module.exports = {
  createTeamValidationRules,
  joinTeamValidationRules,
};
