const crypto = require('crypto');

/**
 * Encryption utility functions
 * Provides AES-256 encryption for sensitive data
 */

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_KEY || 'dhamini-secret-key-32-bytes-long', 'utf8').slice(0, 32);
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt data
 */
const encrypt = (text) => {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt data
 */
const decrypt = (encryptedData) => {
  try {
    const { iv, encrypted, authTag } = encryptedData;
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      SECRET_KEY,
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Hash data (SHA-256)
 */
const hash = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Generate random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate random OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

/**
 * Compare passwords (for bcrypt)
 */
const comparePasswords = (plainPassword, hashedPassword) => {
  const bcrypt = require('bcryptjs');
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

/**
 * Hash password (for bcrypt)
 */
const hashPassword = (plainPassword) => {
  const bcrypt = require('bcryptjs');
  return bcrypt.hashSync(plainPassword, 10);
};

module.exports = {
  encrypt,
  decrypt,
  hash,
  generateToken,
  generateOTP,
  comparePasswords,
  hashPassword
};
