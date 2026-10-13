const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const TransactionItem = sequelize.define(
  'TransactionItem',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    transaction_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },

    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
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
    tableName: 'transaction_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
)

module.exports = TransactionItem