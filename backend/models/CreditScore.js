const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CreditScore = sequelize.define('CreditScore', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    dcsScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 400,
      comment: 'Dhamini Credit Score (300-1000)'
    },
    riskTier: {
      type: DataTypes.ENUM('AAA', 'AA', 'A', 'B', 'C', 'D', 'F'),
      allowNull: false,
      defaultValue: 'D'
    },
    repaymentConsistency: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '35% weight'
    },
    repaymentHistoryDepth: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '20% weight'
    },
    creditUtilization: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '15% weight'
    },
    incomeStability: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '15% weight'
    },
    institutionDiversity: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '10% weight'
    },
    fraudDisputeRecord: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100,
      comment: '5% weight (lower is better)'
    },
    totalRepaymentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    onTimeRepaymentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    lateRepaymentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    missedRepaymentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    totalLoans: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    activeLoans: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    completedLoans: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    defaultedLoans: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    totalLoanAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    outstandingBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    availableCreditLimit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    incomeEstimate: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    incomeEstimationSource: {
      type: DataTypes.ENUM('mpesa', 'bank', 'payroll', 'none'),
      allowNull: true
    },
    lastSalaryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    salaryRegularityScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    institutionTypesUsed: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array of institution types this borrower has used'
    },
    lastScoreUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    scoreHistory: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array of {date, score, tier, reason}'
    },
    crbStatus: {
      type: DataTypes.ENUM('clean', 'listed', 'not_checked'),
      allowNull: false,
      defaultValue: 'not_checked'
    },
    crbScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    crbLastUpdated: {
      type: DataTypes.DATE,
      allowNull: true
    },
    creditEvents: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Negative/negative events from CRBs'
    },
    flags: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Risk flags, alerts, or special conditions'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    calculatedBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'system'
    }
  }, {
    tableName: 'CreditScores',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['dcsScore'] },
      { fields: ['riskTier'] },
      { fields: ['lastScoreUpdate'] },
      { fields: ['crbStatus'] }
    ]
  });

  return CreditScore;
};
