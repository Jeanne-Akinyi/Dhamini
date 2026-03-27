const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Repayment = sequelize.define('Repayment', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    repaymentReference: {
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
    mandateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Mandates',
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
    lenderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Institutions',
        key: 'id'
      }
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    actualPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    installmentNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalInstallments: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    principalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    interestAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    feesAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    penaltyAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    amountPaid: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    paymentMethod: {
      type: DataTypes.ENUM('bank_direct_debit', 'mpesa_stk_push', 'mpesa_c2b', 'mpesa_b2c', 'sacco_payroll', 'chama_wallet', 'cash', 'other'),
      allowNull: true
    },
    paymentReference: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Transaction reference from payment provider'
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'partially_paid', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    maxRetries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3
    },
    nextRetryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    initiatedBy: {
      type: DataTypes.ENUM('auto', 'manual', 'scheduler', 'api'),
      allowNull: false,
      defaultValue: 'auto'
    },
    processedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    deductionAttempted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deductionAttemptedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paymentReceived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    paymentReceivedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reconciled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reconciledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    daysLate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isLate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    blockchainTxId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    paymentGateway: {
      type: DataTypes.ENUM('mpesa', 'pesalink', 'equity', 'kcb', 'co_op', 'ncba', 'absa', 'other'),
      allowNull: true
    },
    mpesaResultCode: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    mpesaResultDesc: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    mpesaMerchantRequestID: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mpesaCheckoutRequestID: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'Repayments',
    timestamps: true,
    indexes: [
      { fields: ['repaymentReference'] },
      { fields: ['loanId'] },
      { fields: ['mandateId'] },
      { fields: ['borrowerId'] },
      { fields: ['lenderId'] },
      { fields: ['scheduledDate'] },
      { fields: ['status'] },
      { fields: ['installmentNumber'] },
      { fields: ['paymentMethod'] },
      { fields: ['mpesaMerchantRequestID'] },
      { fields: ['mpesaCheckoutRequestID'] }
    ]
  });

  return Repayment;
};
