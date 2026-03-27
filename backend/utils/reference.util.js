const crypto = require('crypto');

/**
 * Reference generator utility
 * Generates unique reference numbers for various entities
 */

/**
 * Generate unique reference
 */
const generateReference = (prefix) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}${random}`.slice(0, 20);
};

/**
 * Generate loan reference
 */
const generateLoanReference = () => {
  return generateReference('LN');
};

/**
 * Generate mandate reference
 */
const generateMandateReference = () => {
  return generateReference('MD');
};

/**
 * Generate repayment reference
 */
const generateRepaymentReference = () => {
  return generateReference('PY');
};

/**
 * Generate KYC reference
 */
const generateKYCReference = () => {
  return generateReference('KY');
};

/**
 * Generate credit score reference
 */
const generateCreditScoreReference = () => {
  return generateReference('CS');
};

/**
 * Generate blockchain transaction reference
 */
const generateTransactionReference = () => {
  return generateReference('TX');
};

/**
 * Generate short ID (6 characters)
 */
const generateShortId = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

module.exports = {
  generateReference,
  generateLoanReference,
  generateMandateReference,
  generateRepaymentReference,
  generateKYCReference,
  generateCreditScoreReference,
  generateTransactionReference,
  generateShortId
};
