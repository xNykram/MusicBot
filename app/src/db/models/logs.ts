const { DataTypes } = require('sequelize');
import { sequelize } from '../db'

export const Logs = sequelize.define('Log', {
    server_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    server_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    task: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
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
}, { timestamps: false }, { sequelize, modelName: 'Log' }, { freezeTableName: true });
 