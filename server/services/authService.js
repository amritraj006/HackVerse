import User from '../models/User.js';
import { generateToken } from '../utils/jwtUtils.js';

export class AuthService {
  /**
   * Register a new user
   */
  async registerUser({ name, email, password, role }) {
    // Check if user already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Only allow public creation of participant, organizer, or judge roles
    const allowedRoles = ['participant', 'organizer', 'judge'];
    const assignedRole = allowedRoles.includes(role) ? role : 'participant';

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: assignedRole,
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
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

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

    // Check if user account is suspended/blocked
    if (user.isBlocked) {
      const error = new Error('Your account has been suspended by an administrator. Please contact support.');
      error.statusCode = 403;
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

export const authService = new AuthService();
export default authService;
