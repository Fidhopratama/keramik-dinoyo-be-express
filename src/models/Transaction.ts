const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Transaction = sequelize.define(
  'Transaction',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    transaction_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },

    payment_method: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
)

module.exports = Transaction