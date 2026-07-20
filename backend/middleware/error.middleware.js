const APIError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If it's not our custom APIError, convert it
  if (!(error instanceof APIError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new APIError(message, statusCode, error.errors || []);
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(', ')}`;
    error = new APIError(message, 400);
  }

  // Handle Mongoose cast error (invalid ObjectID)
  if (err.name === 'CastError') {
    const message = `Resource not found with ID of ${err.value}`;
    error = new APIError(message, 404);
  }

  // Handle JsonWebTokenError
  if (err.name === 'JsonWebTokenError') {
    error = new APIError('Invalid token. Please log in again.', 401);
  }

  // Handle TokenExpiredError
  if (err.name === 'TokenExpiredError') {
    error = new APIError('Token expired. Please log in again.', 401);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
