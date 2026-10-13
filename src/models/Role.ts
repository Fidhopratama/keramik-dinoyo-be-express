const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Role = sequelize.define(
  'Role',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
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
    tableName: 'roles',

    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
)

module.exports = Role