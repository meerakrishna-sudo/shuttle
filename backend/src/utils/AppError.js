/**
 * AppError — a custom error class that carries an HTTP status code.
 *
 * Why this matters:
 * JavaScript's built-in Error only has a message. When something goes wrong in
 * our service layer (e.g. "journey not found"), we want to say *both* what went
 * wrong AND which HTTP status code the client should get (404, 409, etc.).
 *
 * Instead of doing that in every controller, we throw an AppError from the
 * service, and the global error handler middleware reads the statusCode and
 * sends the right response automatically.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks errors we intentionally threw (vs. bugs)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
