const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');
const APIError = require('../utils/apiError');

const signup = async ({ name, email, password, role, bio, skills }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new APIError('Email is already registered', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    bio,
    skills,
  });

  const token = generateToken(user._id);

  // Return user without password
  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new APIError('Invalid email or password', 400);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new APIError('Invalid email or password', 400);
  }

  const token = generateToken(user._id);

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new APIError('User not found', 404);
  }
  return user;
};

const updateProfile = async (userId, updateData) => {
  // Prevent direct password modification here
  delete updateData.password;
  delete updateData.role;
  delete updateData.email;

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new APIError('User not found', 404);
  }

  return user;
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
};
