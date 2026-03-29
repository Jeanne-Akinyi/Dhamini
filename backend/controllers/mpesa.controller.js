const https = require('https');
const http = require('http');
const crypto = require('crypto');
const logger = require('../utils/logger.util');

/**
 * M-Pesa Daraja API Controller
 * Handles all M-Pesa payment operations
 * Uses native https module to avoid proxy issues
 */

const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortcode: process.env.MPESA_SHORTCODE,
  passkey: process.env.MPESA_PASSKEY,
  callbackUrl: process.env.MPESA_CALLBACK_URL,
  baseUrl: process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke/mpesa',
  b2cShortcode: process.env.MPESA_B2C_SHORTCODE || process.env.MPESA_SHORTCODE,
  b2cInitiatorName: process.env.MPESA_B2C_INITIATOR_NAME || 'testapi',
  b2cSecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL,
  timeoutUrl: process.env.MPESA_TIMEOUT_URL || 'https://your-domain.com/api/mpesa/timeout',
  resultUrl: process.env.MPESA_RESULT_URL || 'https://your-domain.com/api/mpesa/result'
};

/**
 * Make HTTPS request (native, no proxy)
 */
const httpsRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('M-Pesa Response:', body.substring(0, 200));
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch {
          resolve(body);
        }
      });
    });
    req.on('error', (err) => {
      console.log('M-Pesa Error:', err.message);
      reject(err);
    });
    req.setTimeout(30000, () => {
      console.log('M-Pesa Timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    if (data) {
      req.write(data);
    }
    req.end();
  });
};

/**
 * Internal function to get M-Pesa access token (no req/res)
 */
const getAccessTokenInternal = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    
    const response = await httpsRequest({
      hostname: 'sandbox.safaricom.co.ke',
      path: '/oauth/v1/generate?grant_type=client_credentials',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.access_token) {
      return { success: true, token: response.access_token, expiresIn: response.expires_in };
    } else {
      return { success: false, error: response.errorMessage || 'Failed to get token' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get M-Pesa access token (HTTP endpoint)
 * POST /api/mpesa/token
 */
const getAccessToken = async (req, res) => {
  const result = await getAccessTokenInternal();
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
};

/**
 * Generate security credential (for B2C)
 */
const generateSecurityCredential = () => {
  if (!MPESA_CONFIG.b2cSecurityCredential) {
    return null;
  }
  return Buffer.from(MPESA_CONFIG.b2cSecurityCredential).toString('base64');
};

/**
 * Generate password for STK Push
 * Format: YYYYMMDDHHMMSS
 */
const generateSTKPassword = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  const rawPassword = `${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`;
  return {
    password: Buffer.from(rawPassword).toString('base64'),
    timestamp
  };
};

/**
 * Make STK Push request
 */
const stkPushRequest = async (token, stkData) => {
  const hostname = MPESA_CONFIG.baseUrl.includes('sandbox') ? 'sandbox.safaricom.co.ke' : 'api.safaricom.co.ke';
  const path = '/mpesa/stkpush/v1/processrequest';
  
  return httpsRequest({
    hostname,
    path,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, JSON.stringify(stkData));
};

/**
 * Make B2C request
 */
const b2cRequest = async (token, b2cData) => {
  const hostname = MPESA_CONFIG.baseUrl.includes('sandbox') ? 'sandbox.safaricom.co.ke' : 'api.safaricom.co.ke';
  const path = '/mpesa/b2c/v1/paymentrequest';
  
  return httpsRequest({
    hostname,
    path,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, JSON.stringify(b2cData));
};

/**
 * STK Push - Collect payment from customer
 * POST /api/mpesa/stkpush
 */
const initiateSTKPush = async (req, res) => {
  try {
    const { phoneNumber, amount, accountReference, transactionDesc } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and amount are required'
      });
    }

    // Get access token
    const tokenResult = await getAccessTokenInternal();
    if (!tokenResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to authenticate with M-Pesa: ' + tokenResult.error
      });
    }

    // Generate password and merchant request ID
    const { password, timestamp } = generateSTKPassword();
    const merchantRequestID = crypto.randomBytes(10).toString('hex');
    
    // Normalize phone number
    const normalizedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber.substring(1) 
      : phoneNumber;

    // Prepare STK Push request
    const stkPushData = {
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: parseInt(amount),
      PartyA: normalizedPhone,
      PartyB: MPESA_CONFIG.shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: `${MPESA_CONFIG.callbackUrl}?merchantRequestID=${merchantRequestID}`,
      AccountReference: accountReference || 'DHAMINI',
      TransactionDesc: transactionDesc || 'Loan Repayment'
    };

    // Send STK Push
    const response = await stkPushRequest(tokenResult.token, stkPushData);

    logger.info(`STK Push initiated - MerchantRequestID: ${merchantRequestID}, Phone: ${normalizedPhone}`);

    return res.status(200).json({
      success: true,
      merchantRequestID,
      checkoutRequestID: response.CheckoutRequestID,
      responseCode: response.ResponseCode,
      responseDescription: response.ResponseDescription,
      customerMessage: response.CustomerMessage
    });

  } catch (error) {
    logger.error('STK Push failed:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * STK Push Query - Check payment status
 * POST /api/mpesa/stkquery
 */
const querySTKStatus = async (req, res) => {
  try {
    const { checkoutRequestID } = req.body;

    if (!checkoutRequestID) {
      return res.status(400).json({
        success: false,
        error: 'CheckoutRequestID is required'
      });
    }

    // Get access token
    const tokenResult = await getAccessTokenInternal();
    if (!tokenResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to authenticate with M-Pesa'
      });
    }

    // Generate password
    const { password, timestamp } = generateSTKPassword();

    const hostname = MPESA_CONFIG.baseUrl.includes('sandbox') ? 'sandbox.safaricom.co.ke' : 'api.safaricom.co.ke';
    
    const queryData = {
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID
    };

    const response = await httpsRequest({
      hostname,
      path: '/mpesa/stkpush/v1/queryrequest',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(queryData));

    logger.info(`STK Query - CheckoutRequestID: ${checkoutRequestID}, Result: ${response.ResponseCode}`);

    return res.status(200).json({
      success: true,
      responseCode: response.ResponseCode,
      responseDescription: response.ResponseDescription,
      merchantRequestID: response.MerchantRequestID,
      checkoutRequestID: response.CheckoutRequestID,
      amount: response.Amount,
      mpesaReceiptNumber: response.MpesaReceiptNumber,
      transactionDate: response.TransactionDate,
      phoneNumber: response.PhoneNumber
    });

  } catch (error) {
    logger.error('STK Query failed:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * B2C Payment - Send money to customer
 * POST /api/mpesa/b2c
 */
const initiateB2CPayment = async (req, res) => {
  try {
    const { phoneNumber, amount, remarks, occasion } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and amount are required'
      });
    }

    // Get access token
    const tokenResult = await getAccessTokenInternal();
    if (!tokenResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to authenticate with M-Pesa'
      });
    }

    // Generate password
    const { password } = generateSTKPassword();

    // Normalize phone number
    const normalizedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber.substring(1) 
      : phoneNumber;

    const b2cData = {
      InitiatorName: MPESA_CONFIG.b2cInitiatorName,
      SecurityCredential: generateSecurityCredential() || password,
      CommandID: 'PromotionPayment',
      Amount: parseInt(amount),
      PartyA: MPESA_CONFIG.b2cShortcode,
      PartyB: normalizedPhone,
      Remarks: remarks || 'Loan Disbursement',
      QueueTimeOutURL: `${MPESA_CONFIG.timeoutUrl}?type=b2c`,
      ResultURL: `${MPESA_CONFIG.resultUrl}?type=b2c`,
      Occasion: occasion || 'Disbursement'
    };

    const response = await b2cRequest(tokenResult.token, b2cData);

    logger.info(`B2C Payment initiated - Phone: ${normalizedPhone}, Amount: ${amount}`);

    return res.status(200).json({
      success: true,
      conversationID: response.ConversationID,
      originatorConversationID: response.OriginatorConversationID,
      responseCode: response.ResponseCode,
      responseDescription: response.ResponseDescription
    });

  } catch (error) {
    logger.error('B2C Payment failed:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * C2B Register URL - Register callback URLs for C2B
 * POST /api/mpesa/c2b-register
 */
const registerC2BURLs = async (req, res) => {
  try {
    // Get access token
    const tokenResult = await getAccessTokenInternal();
    if (!tokenResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to authenticate with M-Pesa'
      });
    }

    const hostname = MPESA_CONFIG.baseUrl.includes('sandbox') ? 'sandbox.safaricom.co.ke' : 'api.safaricom.co.ke';
    
    const registerData = {
      ShortCode: MPESA_CONFIG.shortcode,
      ResponseType: 'Completed',
      ConfirmationURL: `${MPESA_CONFIG.callbackUrl}?type=confirmation`,
      ValidationURL: `${MPESA_CONFIG.callbackUrl}?type=validation`
    };

    const response = await httpsRequest({
      hostname,
      path: '/mpesa/c2b/v1/registerurl',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(registerData));

    logger.info('C2B URLs registered successfully');

    return res.status(200).json({
      success: true,
      responseCode: response.ResponseCode,
      responseDescription: response.ResponseDescription
    });

  } catch (error) {
    logger.error('C2B Register failed:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * C2B Simulate - Simulate a C2B transaction (Sandbox only)
 * POST /api/mpesa/c2b-simulate
 */
const simulateC2B = async (req, res) => {
  try {
    const { shortCode, commandID, amount, msisdn, billRefNumber } = req.body;

    // Get access token
    const tokenResult = await getAccessTokenInternal();
    if (!tokenResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to authenticate with M-Pesa'
      });
    }

    const hostname = 'sandbox.safaricom.co.ke';
    
    const simulateData = {
      ShortCode: shortCode || MPESA_CONFIG.shortcode,
      CommandID: commandID || 'CustomerPayBillOnline',
      Amount: parseInt(amount),
      Msisdn: msisdn,
      BillRefNumber: billRefNumber || 'DHAMINI'
    };

    const response = await httpsRequest({
      hostname,
      path: '/mpesa/c2b/v1/simulate',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(simulateData));

    logger.info(`C2B Simulated - Phone: ${msisdn}, Amount: ${amount}`);

    return res.status(200).json({
      success: true,
      responseCode: response.ResponseCode,
      responseDescription: response.ResponseDescription
    });

  } catch (error) {
    logger.error('C2B Simulate failed:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Account Balance Query
 * POST /api/mpesa/balance
 */
const queryAccountBalance = async (req, res) => {
  try {
    // Get access token
    const tokenResult = await getAccessTokenInternal();
    if (!tokenResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to authenticate with M-Pesa'
      });
    }

    const hostname = MPESA_CONFIG.baseUrl.includes('sandbox') ? 'sandbox.safaricom.co.ke' : 'api.safaricom.co.ke';
    const { password } = generateSTKPassword();

    const balanceData = {
      Initiator: MPESA_CONFIG.b2cInitiatorName,
      SecurityCredential: generateSecurityCredential() || password,
      CommandID: 'BalanceInquiry',
      PartyA: MPESA_CONFIG.shortcode,
      IdentifierType: '4',
      Remarks: 'Balance Inquiry',
      QueueTimeOutURL: `${MPESA_CONFIG.timeoutUrl}?type=balance`,
      ResultURL: `${MPESA_CONFIG.resultUrl}?type=balance`
    };

    const response = await httpsRequest({
      hostname,
      path: '/mpesa/accountbalance/v1/query',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(balanceData));

    logger.info('Account Balance Query initiated');

    return res.status(200).json({
      success: true,
      responseCode: response.ResponseCode,
      responseDescription: response.ResponseDescription,
      conversationID: response.ConversationID
    });

  } catch (error) {
    logger.error('Balance Query failed:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Transaction Status Query
 * POST /api/mpesa/transaction-status
 */
const queryTransactionStatus = async (req, res) => {
  try {
    const { transactionID, identifierType = 4 } = req.body;

    if (!transactionID) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID is required'
      });
    }

    // Get access token
    const tokenResult = await getAccessTokenInternal();
    if (!tokenResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to authenticate with M-Pesa'
      });
    }

    const hostname = MPESA_CONFIG.baseUrl.includes('sandbox') ? 'sandbox.safaricom.co.ke' : 'api.safaricom.co.ke';
    const { password } = generateSTKPassword();

    const statusData = {
      Initiator: MPESA_CONFIG.b2cInitiatorName,
      SecurityCredential: generateSecurityCredential() || password,
      CommandID: 'TransactionStatusQuery',
      TransactionID: transactionID,
      PartyA: MPESA_CONFIG.shortcode,
      IdentifierType: identifierType,
      Remarks: 'Transaction Status Check',
      QueueTimeOutURL: `${MPESA_CONFIG.timeoutUrl}?type=status`,
      ResultURL: `${MPESA_CONFIG.resultUrl}?type=status`
    };

    const response = await httpsRequest({
      hostname,
      path: '/mpesa/transactionstatus/v1/query',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(statusData));

    logger.info(`Transaction Status Query - ID: ${transactionID}`);

    return res.status(200).json({
      success: true,
      responseCode: response.ResponseCode,
      responseDescription: response.ResponseDescription,
      conversationID: response.ConversationID
    });

  } catch (error) {
    logger.error('Transaction Status Query failed:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Reversal - Reverse a transaction
 * POST /api/mpesa/reversal
 */
const reverseTransaction = async (req, res) => {
  try {
    const { transactionID, amount } = req.body;

    if (!transactionID || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID and amount are required'
      });
    }

    // Get access token
    const tokenResult = await getAccessTokenInternal();
    if (!tokenResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to authenticate with M-Pesa'
      });
    }

    const hostname = MPESA_CONFIG.baseUrl.includes('sandbox') ? 'sandbox.safaricom.co.ke' : 'api.safaricom.co.ke';
    const { password } = generateSTKPassword();

    const reversalData = {
      Initiator: MPESA_CONFIG.b2cInitiatorName,
      SecurityCredential: generateSecurityCredential() || password,
      CommandID: 'TransactionReversal',
      TransactionID: transactionID,
      Amount: parseInt(amount),
      ReceiverParty: MPESA_CONFIG.shortcode,
      RecieverIdentifierType: '4',
      Remarks: 'Transaction Reversal',
      QueueTimeOutURL: `${MPESA_CONFIG.timeoutUrl}?type=reversal`,
      ResultURL: `${MPESA_CONFIG.resultUrl}?type=reversal`
    };

    const response = await httpsRequest({
      hostname,
      path: '/mpesa/reversal/v1/request',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`,
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(reversalData));

    logger.info(`Transaction Reversal initiated - ID: ${transactionID}, Amount: ${amount}`);

    return res.status(200).json({
      success: true,
      responseCode: response.ResponseCode,
      responseDescription: response.ResponseDescription,
      conversationID: response.ConversationID
    });

  } catch (error) {
    logger.error('Transaction Reversal failed:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get Configuration Status
 * GET /api/mpesa/config
 */
const getConfig = async (req, res) => {
  return res.status(200).json({
    success: true,
    configured: {
      consumerKey: !!MPESA_CONFIG.consumerKey,
      consumerSecret: !!MPESA_CONFIG.consumerSecret,
      shortcode: !!MPESA_CONFIG.shortcode,
      passkey: !!MPESA_CONFIG.passkey,
      callbackUrl: !!MPESA_CONFIG.callbackUrl
    },
    baseUrl: MPESA_CONFIG.baseUrl.includes('sandbox') ? 'Sandbox' : 'Production'
  });
};

module.exports = {
  getAccessToken,
  initiateSTKPush,
  querySTKStatus,
  initiateB2CPayment,
  registerC2BURLs,
  simulateC2B,
  queryAccountBalance,
  queryTransactionStatus,
  reverseTransaction,
  getConfig
};
