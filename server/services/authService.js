const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');

class AuthService {
  /**
   * Register a new user
   */
  async registerUser({ name, email, password, role }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'participant',
    });

    // Generate JWT Token
    const token = generateToken(user);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Authenticate user & return token
   */
  async loginUser({ email, password }) {
    // Find user and explicitly include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT Token
    const token = generateToken(user);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user.toJSON();
  }
}

module.exports = new AuthService();
