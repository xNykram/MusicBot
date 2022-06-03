const { DataTypes } = require('sequelize');
import { sequelize } from '../db'

export const Server = sequelize.define('Servers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    server_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount_of_users: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    }
}, { freezeTableName: true } , { sequelize, modelName: 'Servers'});
 