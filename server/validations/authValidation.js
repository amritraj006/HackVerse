const { body, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Handle express-validator validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, 'Validation failed', errors.array());
  }
  next();
};

const registerValidationRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate,
];

const loginValidationRules = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

module.exports = {
  registerValidationRules,
  loginValidationRules,
};
