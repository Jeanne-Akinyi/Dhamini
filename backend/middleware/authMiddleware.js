const jwtService = require('../services/jwt.service');
const { error } = require('../utils/response.util');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
function authenticate(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'No authentication token provided', 401);
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwtService.verifyToken(token);

    if (!decoded) {
      return error(res, 'Invalid or expired token', 401);
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return error(res, 'Authentication failed', 500);
  }
}

/**
 * Authorization middleware
 * Checks if user has required role(s)
 * @param {string|Array} roles - Role or array of roles allowed to access
 */
function authorize(...roles) {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user) {
        return error(res, 'User not authenticated', 401);
      }

      // Check if user has required role
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return error(
          res,
          `Access denied. Required role(s): ${roles.join(', ')}`,
          403
        );
      }

      next();
    } catch (err) {
      console.error('Authorization error:', err);
      return error(res, 'Authorization failed', 500);
    }
  };
}

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't fail if not
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwtService.verifyToken(token);

      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch (err) {
    console.error('Optional auth error:', err);
    // Continue without attaching user
    next();
  }
}

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};