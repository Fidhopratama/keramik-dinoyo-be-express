const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const AuditLog = sequelize.define(
  'AuditLog',
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

    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    entity_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    entity_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    old_values: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    new_values: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },

    user_agent: {
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
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
)

module.exports = AuditLog