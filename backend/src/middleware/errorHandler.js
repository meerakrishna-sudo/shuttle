/**
 * Global error handler — the last middleware in the chain.
 *
 * Any time a controller or service calls next(err) or throws inside an
 * async handler, Express routes the error here. This means we never need
 * try/catch blocks in controllers for the "send 500" case — it's handled once.
 *
 * We distinguish two kinds of errors:
 *   - Operational errors (AppError): things we expected, like "seat not found".
 *     These get the exact statusCode and message we set.
 *   - Programming errors (bugs, unexpected throws): these get a generic 500
 *     and we log the stack trace so we can fix the bug.
 */
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const handleMongooseCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleMongooseDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists`, 409);
};

const handleMongooseValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(messages.join('. '), 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpired = () => new AppError('Token expired. Please log in again.', 401);

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // Convert known Mongoose/JWT errors into AppErrors with useful messages
  if (err.name === 'CastError') error = handleMongooseCastError(err);
  if (err.code === 11000) error = handleMongooseDuplicateKey(err);
  if (err.name === 'ValidationError') error = handleMongooseValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpired();

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Something went wrong';

  if (statusCode >= 500) {
    logger.error('Unhandled error', { message: err.message, stack: err.stack, path: req.path });
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : message,
    ...(process.env.NODE_ENV !== 'production' && statusCode === 500 && { stack: err.stack }),
  });
};

module.exports = errorHandler;
