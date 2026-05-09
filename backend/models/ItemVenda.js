import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const ItemVenda = sequelize.define('ItemVenda', {
  quantidade: DataTypes.INTEGER,
  precoUnitario: DataTypes.FLOAT
});
