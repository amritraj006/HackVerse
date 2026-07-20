const User = require('../models/user.model');
const APIResponse = require('../utils/apiResponse');
const { ROLES } = require('../constants/roles');

const getAllUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ name: 1 });
    res.status(200).json(new APIResponse(200, { users }, 'Users list retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getJudges = async (req, res, next) => {
  try {
    const judges = await User.find({ role: ROLES.JUDGE }).select('name email profileImage bio skills').sort({ name: 1 });
    res.status(200).json(new APIResponse(200, { judges }, 'Judges list retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getJudges,
};
