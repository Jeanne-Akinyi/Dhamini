const { error } = require('../utils/response.util');

/**
 * Custom ApplicationError class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found error handler
 */
function notFound(req, res, next) {
  const message = `Route ${req.originalUrl} not found`;
  return error(res, message, 404);
}

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  let { statusCode = 500, message } = err;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error: ' + err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Database connection failed. Please try again later.';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    if (!err.isOperational) {
      message = 'Something went wrong. Please try again later.';
    }
  }

  return error(res, message, statusCode);
}

/**
 * Async error wrapper for route handlers
 * Wraps async functions to catch errors and pass to error handler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation error handler
 */
function validationError(res, errors) {
  const message = 'Validation failed';
  return res.status(400).json({
    success: false,
    error: message,
    details: errors
  });
}

module.exports = {
  AppError,
  notFound,
  errorHandler,
  asyncHandler,
  validationError
};