/**
 * Consistent API response shape.
 *
 * Every endpoint returns the same structure:
 *   { success: true/false, message: "...", data: {...} }
 *
 * This makes the frontend predictable — it always knows where to find data
 * and how to check if the call succeeded.
 */

const sendSuccess = (res, statusCode, message, data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode, message, errors = null) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendPaginated = (res, statusCode, message, data, pagination) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination, // { page, limit, total, totalPages }
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
