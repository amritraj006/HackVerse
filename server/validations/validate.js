import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Reusable express-validator result handler middleware.
 * Returns consistent 400 error response with normalized validation error objects.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      ...err,
    }));
    return errorResponse(res, 400, 'Validation failed', formattedErrors);
  }
  next();
};

export default validate;
