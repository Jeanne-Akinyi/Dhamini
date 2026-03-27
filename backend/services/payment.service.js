const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger.util');
const { cache } = require('../config/redis.config');

/**
 * Payment Service
 * Handles M-Pesa and bank payment integrations
 */

// M-Pesa Daraja Configuration (Sandbox)
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || 'sandbox-key',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || 'sandbox-secret',
  shortcode: process.env.MPESA_SHORTCODE || '174379',
  passkey: process.env.MPESA_PASSKEY || 'passkey-here',
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://your-domain.com/api/repayments/mpesa/callback',
  baseUrl: process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke/mpesa',
  authenticationUrl: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
};

/**
 * Generate M-Pesa STK Push
 */
const processMpesaSTKPush = async (repayment, mandate) => {
  try {
    // Get access token
    const accessToken = await getMpesaAccessToken();
    
    // Timestamp and password
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -4);
    const rawPassword = `${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`;
    const password = Buffer.from(rawPassword).toString('base64');
    
    // Generate merchant request ID
    const merchantRequestID = crypto.randomBytes(10).toString('hex');
    
    // Prepare STK Push request
    const stkPushData = {
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: repayment.totalAmount,
      PartyA: mandate.mpesaPhoneNumber,
      PartyB: MPESA_CONFIG.shortcode,
      PhoneNumber: mandate.mpesaPhoneNumber,
      CallBackURL: `${MPESA_CONFIG.callbackUrl}?MerchantRequestID=${merchantRequestID}`,
      AccountReference: repayment.repaymentReference,
      TransactionDesc: 'Loan Repayment'
    };
    
    // Send STK Push
    const response = await axios.post(
      `${MPESA_CONFIG.baseUrl}/mpesa/stkpush/v1/processrequest`,
      stkPushData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Update repayment with M-Pesa details
    repayment.mpesaMerchantRequestID = merchantRequestID;
    repayment.mpesaCheckoutRequestID = response.data.CheckoutRequestID;
    repayment.paymentMethod = 'mpesa_stk_push';
    repayment.deductionAttempted = true;
    repayment.deductionAttemptedAt = new Date();
    await repayment.save();
    
    logger.info(`M-Pesa STK Push initiated for repayment ${repayment.repaymentReference}`);
    
    return {
      success: true,
      merchantRequestID,
      checkoutRequestID: response.data.CheckoutRequestID,
      responseDescription: response.data.CustomerMessage
    };
  } catch (error) {
    logger.error('M-Pesa STK Push failed:', error);
    
    repayment.status = 'failed';
    repayment.failureReason = error.response?.data?.errorMessage || error.message;
    await repayment.save();
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process bank direct debit
 */
const processBankDirectDebit = async (repayment, mandate) => {
  try {
    // This would integrate with bank APIs
    // For MVP, we'll simulate the process
    
    logger.info(`Bank direct debit processed for repayment ${repayment.repaymentReference} via ${mandate.bankCode}`);
    
    // Simulate success
    repayment.status = 'completed';
    repayment.amountPaid = repayment.totalAmount;
    repayment.paymentReceived = true;
    repayment.paymentReceivedAt = new Date();
    repayment.paymentMethod = 'bank_direct_debit';
    repayment.reconciled = true;
    repayment.reconciledAt = new Date();
    await repayment.save();
    
    return {
      success: true,
      message: 'Bank direct debit processed successfully'
    };
  } catch (error) {
    logger.error('Bank direct debit failed:', error);
    
    repayment.status = 'failed';
    repayment.failureReason = error.message;
    await repayment.save();
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process M-Pesa standing order
 */
const processMpesaStandingOrder = async (repayment, mandate) => {
  try {
    // Standing orders are handled by M-Pesa backend
    // This service initiates the deduction
    
    const accessToken = await getMpesaAccessToken();
    
    // Check balance first (optional)
    // await checkMpesaBalance(mandate.mpesaPhoneNumber, accessToken);
    
    // Initiate standing order deduction
    // This would use standing order API if available
    // For MVP, we use STK Push
    
    return await processMpesaSTKPush(repayment, mandate);
  } catch (error) {
    logger.error('M-Pesa standing order failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get M-Pesa access token
 */
async function getMpesaAccessToken() {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    
    const response = await axios.get(MPESA_CONFIG.authenticationUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    const token = response.data.access_token;
    
    // Cache token for 1 hour (token expires in 1 hour)
    const cacheKey = 'mpesa:access_token';
    const cachedToken = await cache.get(cacheKey);
    
    if (!cachedToken) {
      await cache.set(cacheKey, token, 3599);
    }
    
    return token;
  } catch (error) {
    logger.error('Failed to get M-Pesa access token:', error);
    throw new Error('Failed to authenticate with M-Pesa');
  }
}

/**
 * Process B2C payment (refunds, payouts)
 */
const processMpesaB2C = async (phoneNumber, amount, remarks) => {
  try {
    const accessToken = await getMpesaAccessToken();
    
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -4);
    const rawPassword = `${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`;
    const password = Buffer.from(rawPassword).toString('base64');
    
    const b2cData = {
      InitiatorName: 'testapi',
      SecurityCredential: password,
      CommandID: 'PromotionPayment',
      Amount: amount,
      PartyA: MPESA_CONFIG.shortcode,
      PartyB: phoneNumber,
      Remarks: remarks || 'Payout',
      QueueTimeOutURL: 'https://your-domain.com/api/mpesa/b2c/timeout',
      ResultURL: 'https://your-domain.com/api/mpesa/b2c/result',
      Occasion: 'Payout'
    };
    
    const response = await axios.post(
      `${MPESA_CONFIG.baseUrl}/mpesa/b2c/v1/paymentrequest`,
      b2cData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    logger.info(`M-Pesa B2C payment processed to ${phoneNumber}: KES ${amount}`);
    
    return {
      success: true,
      conversationID: response.data.ConversationID,
      originatorConversationID: response.data.OriginatorConversationID,
      responseDescription: response.data.ResponseDescription
    };
  } catch (error) {
    logger.error('M-Pesa B2C failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check account balance (for NSF prevention)
 */
const checkMpesaBalance = async (phoneNumber, accessToken) => {
  try {
    // This would use M-Pesa balance query API
    // For MVP, return mock data
    return {
      success: true,
      balance: 50000, // Mock balance
      currency: 'KES'
    };
  } catch (error) {
    logger.error('Failed to check M-Pesa balance:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  processMpesaSTKPush,
  processBankDirectDebit,
  processMpesaStandingOrder,
  processMpesaB2C,
  checkMpesaBalance,
  getMpesaAccessToken
};
