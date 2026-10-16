/**
 * Authorization middleware — checks roles AFTER authentication.
 *
 * Authentication = "who are you?" (handled by auth.js)
 * Authorization = "are you allowed to do this?" (handled here)
 *
 * Usage: router.delete('/users/:id', protect, authorize('Admin'), handler)
 * This means: user must be logged in AND must be an Admin to delete.
 */
const AppError = require('../utils/AppError');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not authorized for this action.`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { authorize };
