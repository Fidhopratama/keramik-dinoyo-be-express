const { DataTypes } = require('sequelize')

const sequelize = require('../config/database')

const Workshop = sequelize.define(
  'Workshop',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    instructor: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    capacity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 20,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'upcoming',
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
    tableName: 'workshops',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
)

module.exports = Workshop