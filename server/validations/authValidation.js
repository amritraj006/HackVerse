import { body } from 'express-validator';
import { validate } from './validate.js';

export const registerValidationRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['participant', 'organizer', 'judge', 'admin'])
    .withMessage('Role must be one of: participant, organizer, judge, admin'),
  validate,
];

export const loginValidationRules = [
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

export default {
  registerValidationRules,
  loginValidationRules,
};
