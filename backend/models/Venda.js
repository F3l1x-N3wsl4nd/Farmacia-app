import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Venda = sequelize.define('Venda', {
  data: DataTypes.DATE,
  cliente: DataTypes.STRING,
  funcionario: DataTypes.STRING,
  total: DataTypes.FLOAT,
  metodoPagamento: DataTypes.STRING
});
