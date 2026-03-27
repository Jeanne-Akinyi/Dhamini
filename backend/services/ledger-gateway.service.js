const { Wallets, Gateway } = require('@hyperledger/fabric-gateway');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger.util');
const config = require('./fabric.config');

/**
 * Hyperledger Fabric Gateway Service
 * 
 * This service handles all blockchain interactions for the Dhamini platform.
 * It connects to the Hyperledger Fabric network and provides methods
 * for querying and invoking chaincode.
 */

let gateway = null;
let network = null;
let contract = null;

/**
 * Connect to Fabric gateway and get contract
 */
const connect = async () => {
  try {
    // Create a new file system wallet for managing identities
    const walletPath = path.join(process.cwd(), config.wallet.path);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if identity exists
    const identity = await wallet.get(config.identity.appId);
    if (!identity) {
      logger.warn(`Identity ${config.identity.appId} not found in wallet. Will try to enroll...`);
      await enrollAdminIdentity(wallet);
    }

    // Create a new gateway for connecting to our peer node
    gateway = new Gateway();

    if (config.network.gateway.tls) {
      // TLS connection
      const ccpPath = path.resolve(__dirname, config.network.connectionProfilePath);
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      await gateway.connect(ccp, {
        wallet,
        identity: config.identity.appId,
        discovery: { enabled: true, asLocalhost: config.network.local },
        eventHandlerOptions: {
          commitTimeout: config.chaincode.invokeTimeout,
          strategy: EventStrategies.NETWORK_SCOPE_ALLFORTX
        }
      });
    } else {
      // Non-TLS connection (development)
      await gateway.connect(ccp, {
        wallet,
        identity: config.identity.appId,
        discovery: { enabled: true, asLocalhost: config.network.local }
      });
    }

    // Get the network (channel)
    network = await gateway.getNetwork(config.network.channelName);

    // Get the contract from the network
    contract = network.getContract(config.network.chaincodeName);

    logger.info(`Connected to Fabric gateway on channel: ${config.network.channelName}, chaincode: ${config.network.chaincodeName}`);
    
    return contract;
  } catch (error) {
    logger.error('Failed to connect to Fabric gateway:', error);
    throw new Error(`Failed to connect to Fabric gateway: ${error.message}`);
  }
};

/**
 * Enroll admin identity with Fabric CA
 */
const enrollAdminIdentity = async (wallet) => {
  try {
    const ccpPath = path.resolve(__dirname, config.network.connectionProfilePath);
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const caInfo = ccp.certificateAuthorities[config.identity.adminId];
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caInfo.tlsCACerts, verify: false }, caInfo.caName);

    // Enroll admin
    const enrollment = await ca.enroll({ enrollmentID: config.identity.adminId, enrollmentSecret: 'adminpw' });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes()
      },
      mspId: config.network.mspId,
      type: 'X.509'
    };

    await wallet.put(config.identity.appId, x509Identity);
    logger.info(`Successfully enrolled admin user ${config.identity.appId}`);
  } catch (error) {
    throw new Error(`Failed to enroll admin identity: ${error.message}`);
  }
};

/**
 * Disconnect from Fabric gateway
 */
const disconnect = async () => {
  if (gateway) {
    await gateway.disconnect();
    gateway = null;
    network = null;
    contract = null;
    logger.info('Disconnected from Fabric gateway');
  }
};

/**
 * Invoke chaincode transaction
 */
const invokeTransaction = async (functionName, args = []) => {
  try {
    if (!contract) {
      await connect();
    }

    const result = await contract.submitTransaction(functionName, ...args);
    const resultString = result.toString();
    
    logger.info(`Transaction ${functionName} invoked successfully. Result: ${resultString}`);
    
    return {
      success: true,
      payload: resultString
    };
  } catch (error) {
    logger.error(`Transaction ${functionName} failed:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Query chaincode
 */
const queryChaincode = async (functionName, args = []) => {
  try {
    if (!contract) {
      await connect();
    }

    const result = await contract.evaluateTransaction(functionName, ...args);
    const resultString = result.toString();
    
    logger.info(`Query ${functionName} executed successfully. Result: ${resultString}`);
    
    return {
      success: true,
      payload: resultString
    };
  } catch (error) {
    logger.error(`Query ${functionName} failed:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Log mandate to blockchain
 */
const logMandateToBlockchain = async (mandate, txId = null) => {
  try {
    const mandateData = {
      mandateId: mandate.id,
      mandateReference: mandate.mandateReference,
      borrowerId: mandate.borrowerId,
      loanId: mandate.loanId,
      mandateType: mandate.mandateType,
      amount: mandate.deductionAmount,
      startDate: mandate.startDate,
      endDate: mandate.endDate,
      frequency: mandate.frequency,
      timestamp: new Date().toISOString(),
      hash: mandate.mandateHash || hashMandate(mandate)
    };

    const result = await invokeTransaction('CreateMandate', [
      mandateData.mandateId,
      mandateData.borrowerId,
      mandateData.loanId,
      mandateData.mandateType,
      mandateData.amount.toString(),
      mandateData.startDate,
      mandateData.endDate || '',
      mandateData.frequency,
      mandateData.timestamp,
      mandateData.hash
    ]);

    if (result.success && txId) {
      await updateBlockchainRecord(txId, result.payload, 'confirmed');
    }

    return result;
  } catch (error) {
    logger.error('Failed to log mandate to blockchain:', error);
    throw error;
  }
};

/**
 * Log repayment to blockchain
 */
const logRepaymentToBlockchain = async (repayment, txId = null) => {
  try {
    const repaymentData = {
      repaymentId: repayment.id,
      repaymentReference: repayment.repaymentReference,
      loanId: repayment.loanId,
      borrowerId: repayment.borrowerId,
      lenderId: repayment.lenderId,
      amount: repayment.amountPaid || repayment.totalAmount,
      status: repayment.status,
      paymentDate: repayment.actualPaymentDate || repayment.scheduledDate,
      timestamp: new Date().toISOString(),
      hash: hashRepayment(repayment)
    };

    const result = await invokeTransaction('RecordRepayment', [
      repaymentData.repaymentId,
      repaymentData.loanId,
      repaymentData.borrowerId,
      repaymentData.lenderId,
      repaymentData.amount.toString(),
      repaymentData.status,
      repaymentData.paymentDate,
      repaymentData.timestamp,
      repaymentData.hash
    ]);

    if (result.success && txId) {
      await updateBlockchainRecord(txId, result.payload, 'confirmed');
    }

    return result;
  } catch (error) {
    logger.error('Failed to log repayment to blockchain:', error);
    throw error;
  }
};

/**
 * Log credit score change to blockchain
 */
const logCreditScoreChange = async (creditScore, newScore, oldScore, txId = null) => {
  try {
    const result = await invokeTransaction('RecordCreditScore', [
      creditScore.userId,
      oldScore.toString(),
      newScore.toString(),
      creditScore.riskTier,
      new Date().toISOString(),
      hashCreditScore(creditScore)
    ]);

    if (result.success && txId) {
      await updateBlockchainRecord(txId, result.payload, 'confirmed');
    }

    return result;
  } catch (error) {
    logger.error('Failed to log credit score change to blockchain:', error);
    throw error;
  }
};

/**
 * Query mandate from blockchain
 */
const queryMandate = async (mandateId) => {
  try {
    const result = await queryChaincode('QueryMandate', [mandateId]);
    
    if (result.success) {
      return JSON.parse(result.payload);
    }
    
    return null;
  } catch (error) {
    logger.error('Failed to query mandate from blockchain:', error);
    return null;
  }
};

/**
 * Query repayments for a loan
 */
const queryLoanRepayments = async (loanId) => {
  try {
    const result = await queryChaincode('QueryRepaymentsByLoan', [loanId]);
    
    if (result.success) {
      return JSON.parse(result.payload);
    }
    
    return [];
  } catch (error) {
    logger.error('Failed to query loan repayments from blockchain:', error);
    return [];
  }
};

/**
 * Query credit score history for user
 */
const queryCreditScoreHistory = async (userId) => {
  try {
    const result = await queryChaincode('QueryCreditScoreHistory', [userId]);
    
    if (result.success) {
      return JSON.parse(result.payload);
    }
    
    return [];
  } catch (error) {
    logger.error('Failed to query credit score history from blockchain:', error);
    return [];
  }
};

/**
 * Helper functions for hashing
 */
const crypto = require('crypto');

function hashMandate(mandate) {
  const data = JSON.stringify({
    mandateId: mandate.id,
    borrowerId: mandate.borrowerId,
    loanId: mandate.loanId,
    amount: mandate.deductionAmount,
    frequency: mandate.frequency
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}

function hashRepayment(repayment) {
  const data = JSON.stringify({
    repaymentId: repayment.id,
    loanId: repayment.loanId,
    amount: repayment.amountPaid,
    status: repayment.status
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}

function hashCreditScore(creditScore) {
  const data = JSON.stringify({
    userId: creditScore.userId,
    score: creditScore.dcsScore,
    tier: creditScore.riskTier
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Update blockchain record in database
 */
async function updateBlockchainRecord(txId, transactionHash, status) {
  const { BlockchainRecord } = require('../models');
  
  const record = await BlockchainRecord.findByPk(txId);
  if (record) {
    record.transactionHash = transactionHash;
    record.status = status;
    record.isVerified = status === 'confirmed';
    record.verifiedAt = new Date();
    await record.save();
  }
}

/**
 * Main function to log to blockchain
 * This is called by controllers after database operations
 */
const logToBlockchain = async (recordType, data) => {
  try {
    const BlockchainRecord = require('../models').BlockchainRecord;
    
    // Create blockchain record in database
    const blockchainRecord = await BlockchainRecord.create({
      recordType,
      entity: recordType,
      entityId: data.id || data.mandateId || data.loanId,
      borrowerId: data.borrowerId,
      institutionId: data.lenderId,
      status: 'pending'
    });

    const txId = blockchainRecord.id;

    // Log to blockchain based on record type
    switch (recordType) {
      case 'mandate_creation':
      case 'mandate_revocation':
        await logMandateToBlockchain(data, txId);
        break;
      case 'repayment':
        await logRepaymentToBlockchain(data, txId);
        break;
      case 'credit_score_change':
        await logCreditScoreChange(data, newScore, oldScore, txId);
        break;
      default:
        logger.warn(`Unknown record type: ${recordType}`);
    }

    return blockchainRecord;
  } catch (error) {
    logger.error(`Failed to log ${recordType} to blockchain:`, error);
    throw error;
  }
};

module.exports = {
  connect,
  disconnect,
  invokeTransaction,
  queryChaincode,
  logMandateToBlockchain,
  logRepaymentToBlockchain,
  logCreditScoreChange,
  queryMandate,
  queryLoanRepayments,
  queryCreditScoreHistory,
  logToBlockchain
};
