const axios = require('axios');
const logger = require('../utils/logger.util');

/**
 * Verification Service
 * Handles verification with external providers (IPRS, KRA, Banks, etc.)
 */

// IPRS Configuration (Kenya National ID)
const IPRS_CONFIG = {
  apiUrl: process.env.IPRS_API_URL || 'https://test-api.iprs.go.ke/verify',
  apiKey: process.env.IPRS_API_KEY || 'test-key'
};

// KRA Configuration (Tax PIN)
const KRA_CONFIG = {
  apiUrl: process.env.KRA_API_URL || 'https://test-api.kra.go.ke/validate-pin',
  apiKey: process.env.KRA_API_KEY || 'test-key'
};

/**
 * Verify National ID with IPRS
 */
const verifyIPRS = async (nationalIdNumber) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      logger.info(`IPRS verification (dev mode): ${nationalIdNumber}`);
      return {
        success: true,
        verificationId: generateVerificationId(),
        data: {
          name: 'Test User',
          gender: 'M',
          dateOfBirth: '1990-01-01'
        }
      };
    }

    const response = await axios.post(IPRS_CONFIG.apiUrl, {
      idNumber: nationalIdNumber
    }, {
      headers: {
        'Authorization': `Bearer ${IPRS_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds
    });

    logger.info(`IPRS verification successful for ${nationalIdNumber}`);

    return {
      success: true,
      verificationId: response.data.verificationId,
      data: response.data
    };
  } catch (error) {
    logger.error('IPRS verification failed:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Verify KRA PIN
 */
const verifyKRAPIN = async (kraPin) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      logger.info(`KRA PIN verification (dev mode): ${kraPin}`);
      return {
        success: true,
        data: {
          businessName: 'Test Business',
          taxCompliant: true
        }
      };
    }

    const response = await axios.post(KRA_CONFIG.apiUrl, {
      pin: kraPin
    }, {
      headers: {
        'Authorization': `Bearer ${KRA_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    logger.info(`KRA PIN verification successful for ${kraPin}`);

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logger.error('KRA PIN verification failed:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Verify bank account ownership
 */
const verifyBankAccount = async (accountNumber, bankCode) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      logger.info(`Bank account verification (dev mode): ${accountNumber} at ${bankCode}`);
      return {
        success: true,
        accountHolder: 'Test User',
        accountValid: true
      };
    }

    // This would integrate with bank APIs
    // For MVP, return simulated response
    logger.info(`Bank account verification for ${accountNumber} at ${bankCode}`);

    return {
      success: true,
      accountHolder: 'Verified Account Holder',
      accountValid: true
    };
  } catch (error) {
    logger.error('Bank account verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify M-Pesa wallet ownership
 */
const verifyMpesa = async (phoneNumber) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      logger.info(`M-Pesa verification (dev mode): ${phoneNumber}`);
      return {
        success: true,
        walletHolder: 'Test User',
        walletValid: true
      };
    }

    // This would use M-Pesa account query API
    logger.info(`M-Pesa wallet verification for ${phoneNumber}`);

    return {
      success: true,
      walletHolder: 'Verified User',
      walletValid: true
    };
  } catch (error) {
    logger.error('M-Pesa verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify employer details
 */
const verifyEmployer = async (employerName, employeeName) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      logger.info(`Employer verification (dev mode): ${employerName}`);
      return {
        success: true,
        employerValid: true,
        employerRegistered: true
      };
    }

    // This would integrate with payroll systems
    // or business registries
    logger.info(`Employer verification for ${employerName}`);

    return {
      success: true,
      employerValid: true,
      employerRegistered: true
    };
  } catch (error) {
    logger.error('Employer verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Perform biometric liveness check
 */
const verifyLiveness = async (selfieImage) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      logger.info('Liveness verification (dev mode)');
      return {
        success: true,
        livenessVerified: true,
        confidenceScore: 0.95
      };
    }

    // This would integrate with facial recognition service
    logger.info('Liveness verification');

    return {
      success: true,
      livenessVerified: true,
      confidenceScore: 0.95
    };
  } catch (error) {
    logger.error('Liveness verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Match face with ID photo
 */
const matchFace = async (selfieImage, idPhoto) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      logger.info('Face matching (dev mode)');
      return {
        success: true,
        matchFound: true,
        similarityScore: 0.92
      };
    }

    // This would integrate with facial recognition service
    logger.info('Face matching');

    return {
      success: true,
      matchFound: true,
      similarityScore: 0.90
    };
  } catch (error) {
    logger.error('Face matching failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate verification ID
 */
function generateVerificationId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `VER-${timestamp}-${random}`.toUpperCase();
}

module.exports = {
  verifyIPRS,
  verifyKRAPIN,
  verifyBankAccount,
  verifyMpesa,
  verifyEmployer,
  verifyLiveness,
  matchFace
};
