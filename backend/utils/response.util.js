/**
 * Response utility functions
 * Standardizes API responses across the application
 */

/**
 * Success response
 */
const success = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...data
  });
};

/**
 * Error response
 */
const error = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: message
  });
};

/**
 * Paginated response
 */
const paginated = (res, data, meta = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data: data.data,
    pagination: {
      page: meta.page || 1,
      limit: meta.limit || 20,
      total: meta.total || 0,
      totalPages: Math.ceil((meta.total || 0) / (meta.limit || 20)),
      hasNext: (meta.page || 1) * (meta.limit || 20) < (meta.total || 0),
      hasPrev: (meta.page || 1) > 1
    }
  });
};

/**
 * Created response
 */
const created = (res, data = {}) => {
  return success(res, data, 201);
};

/**
 * No content response
 */
const noContent = (res) => {
  return res.status(204).send();
};

/**
 * Bad request response
 */
const badRequest = (res, message = 'Bad request') => {
  return error(res, message, 400);
};

/**
 * Unauthorized response
 */
const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, message, 401);
};

/**
 * Forbidden response
 */
const forbidden = (res, message = 'Forbidden') => {
  return error(res, message, 403);
};

/**
 * Not found response
 */
const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

/**
 * Conflict response
 */
const conflict = (res, message = 'Conflict') => {
  return error(res, message, 409);
};

/**
 * Unprocessable entity response
 */
const unprocessable = (res, errors = {}) => {
  return res.status(422).json({
    success: false,
    errors: errors
  });
};

module.exports = {
  success,
  error,
  paginated,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessable
};
