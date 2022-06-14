const { DataTypes } = require('sequelize');
import { sequelize } from '../db'

export const Changelog = sequelize.define('changelog', {
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, { freezeTableName: true }, { sequelize, modelName: 'changelog'});
 