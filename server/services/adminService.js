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
   * Get users with pagination, search query, role/status filter, and sorting
   */
  async getUsers({ page = 1, limit = 10, search = '', role = '', isBlocked = '', sortBy = 'createdAt', order = 'desc' }) {
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { skills: { $in: [searchRegex] } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isBlocked !== undefined && isBlocked !== '') {
      query.isBlocked = isBlocked === 'true' || isBlocked === true;
    }

    const sortOrder = order === 'asc' || order === '1' ? 1 : -1;
    const sortObj = {};
    const validSortFields = ['createdAt', 'name', 'email', 'role'];
    if (validSortFields.includes(sortBy)) {
      sortObj[sortBy] = sortOrder;
    } else {
      sortObj.createdAt = -1;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await User.countDocuments(query);
    const pages = Math.ceil(total / limitNum) || 1;

    return {
      users,
      pagination: {
        total,
        page: pageNum,
        pages,
        limit: limitNum,
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
   * Get hackathons with search, status filter, sorting, and pagination
   */
  async getHackathons({ page = 1, limit = 10, search = '', status = '', sortBy = 'createdAt', order = 'desc' }) {
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { tagline: searchRegex },
        { description: searchRegex },
      ];
    }

    if (status) {
      query.status = status;
    }

    const sortOrder = order === 'asc' || order === '1' ? 1 : -1;
    const sortObj = {};
    if (['createdAt', 'title', 'startDate', 'status'].includes(sortBy)) {
      sortObj[sortBy] = sortOrder;
    } else {
      sortObj.createdAt = -1;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const hackathons = await Hackathon.find(query)
      .populate('organizer', 'name email avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Hackathon.countDocuments(query);
    const pages = Math.ceil(total / limitNum) || 1;

    return {
      hackathons,
      pagination: {
        total,
        page: pageNum,
        pages,
        limit: limitNum,
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
   * Get submissions with pagination, search query, status filter, and sorting
   */
  async getSubmissions({ page = 1, limit = 10, search = '', status = '', sortBy = 'createdAt', order = 'desc' }) {
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { tagline: searchRegex },
        { description: searchRegex },
      ];
    }

    if (status) {
      query.status = status;
    }

    const sortOrder = order === 'asc' || order === '1' ? 1 : -1;
    const sortObj = {};
    if (['createdAt', 'title', 'score'].includes(sortBy)) {
      sortObj[sortBy] = sortOrder;
    } else {
      sortObj.createdAt = -1;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const submissions = await Submission.find(query)
      .populate('hackathon', 'title')
      .populate('submittedBy', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Submission.countDocuments(query);
    const pages = Math.ceil(total / limitNum) || 1;

    return {
      submissions,
      pagination: {
        total,
        page: pageNum,
        pages,
        limit: limitNum,
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
