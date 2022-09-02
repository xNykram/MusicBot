const { DataTypes } = require('sequelize');
import { sequelize } from '../db'

export const Logs = sequelize.define('log', {
  server_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  server_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  task: {
    type: DataTypes.STRING,
    allowNull: false
  },
  music_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true
  },
  failed: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true
  }
}, { freezeTableName: true }, { sequelize, modelName: 'log' });

