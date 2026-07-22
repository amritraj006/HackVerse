const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

/**
 * JWT Authentication Middleware
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Access denied. Authorization token missing.');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'hackverse_super_secret_dev_key_987654321'
    );

    // Verify user still exists in database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, 401, 'User belonging to this token no longer exists.');
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired authentication token.');
  }
};

/**
 * Role-Based Access Control Middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Role '${req.user ? req.user.role : 'guest'}' is not authorized to perform this action.`
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
