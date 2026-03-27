const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BlockchainRecord = sequelize.define('BlockchainRecord', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    recordType: {
      type: DataTypes.ENUM('mandate_creation', 'mandate_revocation', 'repayment', 'credit_score_change', 'kyc_completion', 'dispute', 'correction'),
      allowNull: false
    },
    entity: {
      type: DataTypes.ENUM('mandate', 'repayment', 'loan', 'kyc', 'credit_score', 'dispute'),
      allowNull: false
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    mandateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Mandates',
        key: 'id'
      }
    },
    repaymentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Repayments',
        key: 'id'
      }
    },
    loanId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Loans',
        key: 'id'
      }
    },
    borrowerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    institutionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Institutions',
        key: 'id'
      }
    },
    dataHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: 'SHA-256 hash of the data'
    },
    transactionHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Blockchain transaction hash'
    },
    blockNumber: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    blockTimestamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    channel: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'dhaminichannel'
    },
    chaincode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'dhaminicontract'
    },
    network: {
      type: DataTypes.ENUM('fabric_testnet', 'fabric_mainnet'),
      allowNull: false,
      defaultValue: 'fabric_testnet'
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Data payload (off-chain storage reference)'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verificationAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'submitted', 'confirmed', 'failed', 'invalid'),
      allowNull: false,
      defaultValue: 'pending'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    gasUsed: {
      type: DataTypes.DECIMAL(20, 0),
      allowNull: true,
      comment: 'Transaction fee/gas used'
    },
    transactionIndex: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'BlockchainRecords',
    timestamps: true,
    indexes: [
      { fields: ['recordType'] },
      { fields: ['entity'] },
      { fields: ['entityId'] },
      { fields: ['mandateId'] },
      { fields: ['repaymentId'] },
      { fields: ['loanId'] },
      { fields: ['borrowerId'] },
      { fields: ['institutionId'] },
      { fields: ['dataHash'] },
      { fields: ['transactionHash'], unique: true },
      { fields: ['blockNumber'] },
      { fields: ['status'] },
      { fields: ['timestamp'] }
    ]
  });

  return BlockchainRecord;
};
