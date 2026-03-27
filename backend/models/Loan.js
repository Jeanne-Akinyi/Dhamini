const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Loan = sequelize.define('Loan', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    loanReference: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
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
    loanAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    interestRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    interestAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    term: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Loan term in months'
    },
    repaymentFrequency: {
      type: DataTypes.ENUM('weekly', 'biweekly', 'monthly', 'quarterly'),
      allowNull: false,
      defaultValue: 'monthly'
    },
    firstRepaymentDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    finalRepaymentDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'disbursed', 'active', 'completed', 'defaulted', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    disbursementDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    disbursementMethod: {
      type: DataTypes.ENUM('bank_transfer', 'mpesa', 'cash', 'chama_wallet'),
      allowNull: true
    },
    principalRepaid: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    interestRepaid: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalRepaid: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    outstandingBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    amountInArrears: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    daysInArrears: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    nextRepaymentAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    nextRepaymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    purpose: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    security: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    guarantorUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    collateralDetails: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    autopayEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    bankAccountNumber: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    mpesaPhoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Loans',
    timestamps: true,
    indexes: [
      { fields: ['loanReference'] },
      { fields: ['borrowerId'] },
      { fields: ['lenderId'] },
      { fields: ['status'] },
      { fields: ['disbursementDate'] },
      { fields: ['nextRepaymentDate'] },
      { fields: ['createdAt'] }
    ]
  });

  return Loan;
};
