import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Fornecedor = sequelize.define('Fornecedor', {
  nome: DataTypes.STRING,
  telefone: DataTypes.STRING,
  email: DataTypes.STRING
})