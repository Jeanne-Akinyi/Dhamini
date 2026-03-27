const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Mandate = sequelize.define('Mandate', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    mandateReference: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    loanId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Loans',
        key: 'id'
      }
    },
    borrowerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    mandateType: {
      type: DataTypes.ENUM('bank_direct_debit', 'mpesa_stk_push', 'mpesa_standing_order', 'sacco_payroll', 'chama_contribution', 'mfi_field_collection'),
      allowNull: false
    },
    accountType: {
      type: DataTypes.ENUM('bank_account', 'mpesa_wallet', 'sacco_account', 'chama_wallet'),
      allowNull: false
    },
    accountNumber: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    accountName: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    bankCode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    mpesaPhoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    deductionAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    deductionDate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Day of month for deduction (1-31)'
    },
    deductionTimeWindow: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Time window for deduction (e.g., 06:00-12:00)'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    frequency: {
      type: DataTypes.ENUM('once', 'weekly', 'biweekly', 'monthly', 'quarterly'),
      allowNull: false,
      defaultValue: 'monthly'
    },
    totalDeductions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    completedDeductions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    failedDeductions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    amountDeducted: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending_approval', 'active', 'paused', 'completed', 'revoked', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft'
    },
    digitalSignature: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    otpVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    otpVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    iprsConsent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    creditScoringConsent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    dataSharingConsent: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Consent for sharing data with specific institutions'
    },
    mandateHash: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: 'SHA-256 hash for blockchain verification'
    },
    blockchainTxId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    documentUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    revocationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    revokedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    lastDeductionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextDeductionDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'Mandates',
    timestamps: true,
    indexes: [
      { fields: ['mandateReference'] },
      { fields: ['loanId'] },
      { fields: ['borrowerId'] },
      { fields: ['status'] },
      { fields: ['deductionDate'] },
      { fields: ['nextDeductionDate'] },
      { fields: ['mandateHash'] }
    ]
  });

  return Mandate;
};
