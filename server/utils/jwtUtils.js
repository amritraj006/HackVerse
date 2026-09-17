import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token with user id and role payload
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'hackverse_super_secret_dev_key_987654321',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

export default {
  generateToken,
};
