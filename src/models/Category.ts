const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'categories',

    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
)

module.exports = Category