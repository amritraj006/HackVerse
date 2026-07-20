const User = require('../models/user.model');
const { verifyToken } = require('../utils/jwt');
const APIError = require('../utils/apiError');

const protect = async (req, res, next) => {
  let token;

  // Extract Bearer token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new APIError('Not authorized, no token provided', 401));
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new APIError('User associated with this token does not exist', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new APIError('Not authorized, token validation failed', 401));
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new APIError('Auth required', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new APIError(`Role (${req.user.role}) is not authorized to access this resource`, 403));
    }
    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};
