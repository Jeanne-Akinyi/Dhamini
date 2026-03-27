const axios = require('axios');
const logger = require('../utils/logger.util');
const { cache } = require('../config/redis.config');

/**
 * OTP Service
 * Handles OTP generation and sending via SMS
 */

// In production, replace with actual SMS gateway (Africa's Talking)
const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL || 'https://api.africastalking.com/version1/messaging';
const SMS_GATEWAY_API_KEY = process.env.SMS_GATEWAY_API_KEY;
const SMS_GATEWAY_USERNAME = process.env.SMS_GATEWAY_USERNAME;

/**
 * Generate OTP
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
 * Send OTP via SMS
 */
const sendOTP = async (phoneNumber, otp) => {
  try {
    // Store OTP in cache
    await cache.set(`otp:${phoneNumber}`, otp, 300); // 5 minutes
    
    // In development, log OTP instead of sending SMS
    if (process.env.NODE_ENV === 'development') {
      logger.info(`OTP for ${phoneNumber}: ${otp}`);
      return { success: true, otp };
    }
    
    // Send SMS (production)
    if (!SMS_GATEWAY_API_KEY) {
      logger.warn('SMS gateway API key not configured. OTP not sent.');
      return { success: false, error: 'SMS gateway not configured' };
    }

    const message = `Your Dhamini verification code is: ${otp}. Valid for 5 minutes.`;
    
    const response = await axios.post(SMS_GATEWAY_URL, {
      username: SMS_GATEWAY_USERNAME,
      to: phoneNumber,
      message: message
    }, {
      headers: {
        'apiKey': SMS_GATEWAY_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    logger.info(`OTP sent to ${phoneNumber}: ${otp.substring(0, 2)}****`);
    
    return {
      success: true,
      messageId: response.data.SMSMessageData?.Recipients?.[0]?.messageId
    };
  } catch (error) {
    logger.error('Failed to send OTP:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify OTP
 */
const verifyOTP = async (phoneNumber, otp) => {
  try {
    const cachedOtp = await cache.get(`otp:${phoneNumber}`);
    
    if (!cachedOtp) {
      return { valid: false, message: 'OTP has expired' };
    }
    
    if (cachedOtp !== otp) {
      return { valid: false, message: 'Invalid OTP' };
    }
    
    // Delete OTP after successful verification
    await cache.del(`otp:${phoneNumber}`);
    
    return { valid: true };
  } catch (error) {
    logger.error('Failed to verify OTP:', error);
    return { valid: false, message: 'Verification failed' };
  }
};

/**
 * Rate limit check for OTP requests
 */
const checkRateLimit = async (phoneNumber) => {
  const key = `otp-rate:${phoneNumber}`;
  const attempts = await cache.get(key);
  
  if (!attempts) {
    await cache.set(key, 1, 3600); // Reset after 1 hour
    return { allowed: true, attemptsRemaining: 5 };
  }
  
  if (attempts >= 5) {
    return { allowed: false, message: 'Too many OTP requests. Please try again later.' };
  }
  
  await cache.set(key, attempts + 1, 3600);
  return { allowed: true, attemptsRemaining: 5 - (attempts + 1) };
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP,
  checkRateLimit
};
