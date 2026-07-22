const User = require('../models/User');
const Hackathon = require('../models/Hackathon');
const Submission = require('../models/Submission');

class AdminService {
  /**
   * Get overall system metrics and analytics
   */
  async getAnalytics() {
    const totalUsers = await User.countDocuments();
    const participantsCount = await User.countDocuments({ role: 'participant' });
    const organizersCount = await User.countDocuments({ role: 'organizer' });
    const judgesCount = await User.countDocuments({ role: 'judge' });
    const adminsCount = await User.countDocuments({ role: 'admin' });
    const blockedCount = await User.countDocuments({ isBlocked: true });

    const totalHackathons = await Hackathon.countDocuments();
    const activeHackathons = await Hackathon.countDocuments({ status: 'ongoing' });
    const upcomingHackathons = await Hackathon.countDocuments({ status: 'upcoming' });
    const totalSubmissions = await Submission.countDocuments();

    return {
      users: {
        total: totalUsers,
        participants: participantsCount,
        organizers: organizersCount,
        judges: judgesCount,
        admins: adminsCount,
        blocked: blockedCount,
      },
      hackathons: {
        total: totalHackathons,
        active: activeHackathons,
        upcoming: upcomingHackathons,
      },
      submissions: {
        total: totalSubmissions,
      },
    };
  }

  /**
   * Get users with pagination, search query, and role filter
   */
  async getUsers({ page = 1, limit = 10, search = '', role = '', isBlocked = '' }) {
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isBlocked !== '') {
      query.isBlocked = isBlocked === 'true';
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await User.countDocuments(query);
    const pages = Math.ceil(total / parseInt(limit, 10)) || 1;

    return {
      users,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages,
        limit: parseInt(limit, 10),
      },
    };
  }

  /**
   * Toggle or set user block status
   */
  async toggleBlockUser(userId, isBlocked) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'admin') {
      const error = new Error('Administrator accounts cannot be blocked');
      error.statusCode = 400;
      throw error;
    }

    user.isBlocked = isBlocked !== undefined ? isBlocked : !user.isBlocked;
    await user.save();
    return user.toJSON();
  }

  /**
   * Update user role
   */
  async updateUserRole(userId, role) {
    const validRoles = ['participant', 'organizer', 'judge', 'admin'];
    if (!validRoles.includes(role)) {
      const error = new Error('Invalid user role specified');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    user.role = role;
    await user.save();
    return user.toJSON();
  }

  /**
   * Delete user by ID
   */
  async deleteUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'admin') {
      const error = new Error('Administrator accounts cannot be deleted');
      error.statusCode = 400;
      throw error;
    }

    await User.findByIdAndDelete(userId);
    return { id: userId, message: 'User deleted successfully' };
  }

  /**
   * Get hackathons with search, status filter, and pagination
   */
  async getHackathons({ page = 1, limit = 10, search = '', status = '' }) {
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const hackathons = await Hackathon.find(query)
      .populate('organizer', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Hackathon.countDocuments(query);
    const pages = Math.ceil(total / parseInt(limit, 10)) || 1;

    return {
      hackathons,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages,
        limit: parseInt(limit, 10),
      },
    };
  }

  /**
   * Delete hackathon by ID
   */
  async deleteHackathon(hackathonId) {
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      const error = new Error('Hackathon not found');
      error.statusCode = 404;
      throw error;
    }

    await Hackathon.findByIdAndDelete(hackathonId);
    return { id: hackathonId, message: 'Hackathon deleted successfully' };
  }

  /**
   * Get submissions with pagination and search query
   */
  async getSubmissions({ page = 1, limit = 10, search = '' }) {
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const submissions = await Submission.find(query)
      .populate('hackathon', 'title')
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Submission.countDocuments(query);
    const pages = Math.ceil(total / parseInt(limit, 10)) || 1;

    return {
      submissions,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages,
        limit: parseInt(limit, 10),
      },
    };
  }

  /**
   * Delete submission by ID
   */
  async deleteSubmission(submissionId) {
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      const error = new Error('Submission not found');
      error.statusCode = 404;
      throw error;
    }

    await Submission.findByIdAndDelete(submissionId);
    return { id: submissionId, message: 'Submission deleted successfully' };
  }
}

module.exports = new AdminService();
