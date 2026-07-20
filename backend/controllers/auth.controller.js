const authService = require('../services/auth.service');
const APIResponse = require('../utils/apiResponse');

const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, bio, skills } = req.body;
    const data = await authService.signup({ name, email, password, role, bio, skills });
    res.status(201).json(new APIResponse(201, data, 'User signed up successfully'));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login({ email, password });
    res.status(200).json(new APIResponse(200, data, 'User logged in successfully'));
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    res.status(200).json(new APIResponse(200, { user }, 'User profile retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user._id, req.body);
    res.status(200).json(new APIResponse(200, { user }, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
};
