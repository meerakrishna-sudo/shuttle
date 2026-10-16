const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async ({ firstName, lastName, email, password, phoneNumber, role, licenseNumber }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    firstName,
    lastName,
    email,
    passwordHash,
    phoneNumber,
    role: role || 'Passenger',
    licenseNumber,
  });

  const token = generateToken(user._id, user.role);

  return {
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  };
};

const login = async ({ email, password, role }) => {
  const user = await User.findOne({ email, role });
  if (!user) throw new AppError('Invalid credentials', 401);

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new AppError('Invalid credentials', 401);

  if (!user.isActive) throw new AppError('Account has been deactivated', 403);

  const token = generateToken(user._id, user.role);

  return {
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = { register, login };
