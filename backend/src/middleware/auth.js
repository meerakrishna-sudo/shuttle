/**
 * Authentication middleware — verifies the JWT on every protected route.
 *
 * How JWT works (interview-ready explanation):
 * 1. User logs in → server signs a token containing { userId, role } with a secret key
 * 2. Client stores the token and sends it as: Authorization: Bearer <token>
 * 3. On every protected request, this middleware checks the signature.
 *    If the secret matches, the token is genuine — we know who the user is.
 * 4. We never store the token on the server. Stateless = scales to many servers.
 *
 * We attach req.user so downstream controllers know who's making the request.
 */
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No token provided. Please log in.', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify the user still exists (handles deleted accounts)
    const user = await User.findById(decoded.id).select('-passwordHash').lean();
    if (!user) {
      return next(new AppError('User no longer exists.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err); // JWT errors are caught and converted in errorHandler
  }
};

module.exports = { protect };
