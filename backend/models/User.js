import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const User = sequelize.define('User', {
  nome: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  senha: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM('admin', 'vendedor'),
    defaultValue: 'vendedor'
  }
});
