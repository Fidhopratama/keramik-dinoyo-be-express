const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    role_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    remember_token: {
      type: DataTypes.STRING(100),
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

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'users',

    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
)

module.exports = User