const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('./authHandler');
const logger = require('../utils/logger.util');
const cache = require('../config/redis.config');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    // Check if token is blacklisted (for logout functionality)
    const isBlacklisted = await cache.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new AppError('Token has been revoked', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dhamini-secret-key-2025');

    // Check if user exists
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user is active
    if (user.status === 'suspended') {
      throw new AppError('User account is suspended', 403);
    }

    // Attach user info to request
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.institutionId = decoded.institutionId;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired'
      });
    }
    
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has one of the required roles
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
    }

    next();
  };
};

/**
 * Institution check middleware
 * Verifies that the user belongs to the specified institution
 */
const checkInstitution = (req, res, next) => {
  if (req.userRole !== 'lender' && req.userRole !== 'sacco_admin' && req.userRole !== 'chama_admin' && req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access institution resources'
    });
  }
  next();
};

/**
 * Admin check middleware
 * Verifies that user is an admin
 */
const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

/**
 * Lender check middleware
 * Verifies that user is a lender or SACCO admin
 */
const isLender = (req, res, next) => {
  const lenderRoles = ['lender', 'sacco_admin', 'chama_admin', 'admin'];
  if (!lenderRoles.includes(req.userRole)) {
    return res.status(403).json({
      success: false,
      error: 'Lender access required'
    });
  }
  next();
};

/**
 * Borrower check middleware
 * Verifies that user is a borrower
 */
const isBorrower = (req, res, next) => {
  if (req.userRole !== 'borrower') {
    return res.status(403).json({
      success: false,
      error: 'Borrower access required'
    });
  }
  next();
};

module.exports = {
  authenticate,
  authorizeRoles,
  checkInstitution,
  isAdmin,
  isLender,
  isBorrower
};
