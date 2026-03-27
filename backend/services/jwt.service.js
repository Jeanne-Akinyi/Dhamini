const jwt = require('jsonwebtoken');

/**
 * JWT Service
 * Handles token generation and verification for Dhamini authentication
 */

const JWT_SECRET = process.env.JWT_SECRET || 'dhamini-secret-key-2025-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d';

/**
 * Generate JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'dhamini-api',
    audience: 'dhamini-users'
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
    issuer: 'dhamini-api',
    audience: 'dhamini-refresh'
  });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'dhamini-api'
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return null;
    }
    return null;
  }
};

/**
 * Decode token without verification (for debugging)
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Get token expiry date
 */
const getTokenExpiry = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  return new Date(decoded.exp * 1000);
};

/**
 * Check if token is expired
 */
const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  return Date.now() / 1000 > decoded.exp;
};

/**
 * Generate access and refresh token pair
 */
const generateTokenPair = (payload) => {
  return {
    accessToken: generateToken(payload),
    refreshToken: generateRefreshToken(payload.userId),
    expiresIn: JWT_EXPIRY,
    tokenType: 'Bearer'
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  getTokenExpiry,
  isTokenExpired,
  generateTokenPair
};
