const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');

// Controllers are intentionally thin: receive request → call service → send response
// All business logic lives in the service

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, 201, 'Account created successfully', result);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, 200, 'Login successful', result);
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  sendSuccess(res, 200, 'Profile fetched', { user: req.user });
};

module.exports = { register, login, getMe };
