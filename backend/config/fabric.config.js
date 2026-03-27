/**
 * Hyperledger Fabric Configuration
 * 
 * This configuration file contains all the settings needed to connect
 * to the Hyperledger Fabric network for Dhamini blockchain operations.
 */

module.exports = {
  // Network Configuration
  network: {
    // Connection profile path (relative to project root)
    connectionProfilePath: process.env.FABRIC_CONNECTION_PROFILE || './config/fabric-connection-profile.yaml',
    
    // Channel name
    channelName: process.env.FABRIC_CHANNEL || 'dhaminichannel',
    
    // Chaincode name
    chaincodeName: process.env.FABRIC_CHAINCODE || 'dhaminicontract',
    
    // MSP ID for this organization
    mspId: process.env.FABRIC_MSP_ID || 'DhaminiMSP',
    
    // Organization name
    organization: process.env.FABRIC_ORG_NAME || 'Dhamini',
    
    // Local Fabric network settings (for development)
    local: process.env.NODE_ENV === 'development',
    
    // Gateway connection settings
    gateway: {
      // Gateway peer location (for local development)
      peer: process.env.FABRIC_PEER || 'localhost:7051',
      
      // Gateway connection timeout (in seconds)
      connectionTimeout: parseInt(process.env.FABRIC_CONNECTION_TIMEOUT) || 30,
      
      // Enable/disable TLS
      tls: process.env.FABRIC_TLS === 'true',
      
      // Server host override (for TLS)
      serverHostName: process.env.FABRIC_SERVER_HOST_NAME || 'peer0.dhamini.example.com'
    }
  },

  // Wallet configuration
  wallet: {
    // Wallet storage location
    path: process.env.FABRIC_WALLET_PATH || './wallet'
  },

  // Identity configuration
  identity: {
    // Identity to use for gateway connection
    adminId: process.env.FABRIC_ADMIN_ID || 'admin',
    
    // Identity to use for application operations
    appId: process.env.FABRIC_APP_ID || 'appUser'
  },

  // Blockchain network endpoints (production)
  peers: {
    peer0: process.env.FABRIC_PEER0 || 'peer0.dhamini.example.com:7051',
    peer1: process.env.FABRIC_PEER1 || 'peer1.dhamini.example.com:8051'
  },

  orderers: {
    orderer: process.env.FABRIC_ORDERER || 'orderer.dhamini.example.com:7050'
  },

  // Chaincode configuration
  chaincode: {
    version: process.env.FABRIC_CHAINCODE_VERSION || '1.0',
    
    // Transaction timeout (in seconds)
    invokeTimeout: parseInt(process.env.FABRIC_INVOKE_TIMEOUT) || 60,
    
    // Query timeout (in seconds)
    queryTimeout: parseInt(process.env.FABRIC_QUERY_TIMEOUT) || 30
  },

  // Event hub configuration
  eventHub: {
    // Enable event replay
    replay: true,
    
    // Event replay start block
    replayBlockOffset: 0
  },

  // Logging configuration
  logging: {
    // Log level: none, error, warn, info, debug
    level: process.env.FABRIC_LOG_LEVEL || 'info',
    
    // Enable logging to console
    console: true,
    
    // Log file location (optional)
    file: process.env.FABRIC_LOG_FILE
  }
};
