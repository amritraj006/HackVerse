import { errorResponse } from '../utils/apiResponse.js';

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, 404, `Cannot find route ${req.originalUrl} on this server`);
};

/**
 * Global Error Handler Middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errors = process.env.NODE_ENV === 'development' ? err.stack : null;

  return errorResponse(res, statusCode, message, errors);
};

export default {
  notFoundHandler,
  globalErrorHandler,
};
