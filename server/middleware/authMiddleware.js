const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/apiResponse');

/**
 * JWT Authentication Middleware Placeholder
 */
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'hackverse_super_secret_dev_key_987654321'
    );
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired authentication token.');
  }
};

/**
 * Role-Based Access Control Placeholder
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this resource.`
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
