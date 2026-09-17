import { body } from 'express-validator';
import { validate } from './validate.js';

export const createHackathonValidationRules = [
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

export const updateHackathonValidationRules = [
  body('title').optional().notEmpty().withMessage('Hackathon title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('registrationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Valid registration deadline is required'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max participants must be a non-negative number'),
  validate,
];

export default {
  createHackathonValidationRules,
  updateHackathonValidationRules,
};
