import { body } from 'express-validator';
import { validate } from './validate.js';

export const createTeamValidationRules = [
  body('hackathonId')
    .notEmpty()
    .withMessage('Hackathon ID is required')
    .isMongoId()
    .withMessage('Invalid Hackathon ID format'),
  body('name').trim().notEmpty().withMessage('Team name is required'),
  validate,
];

export const joinTeamValidationRules = [
  body('joinCode').trim().notEmpty().withMessage('Join code is required'),
  validate,
];

export default {
  createTeamValidationRules,
  joinTeamValidationRules,
};
