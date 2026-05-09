import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Medicamento = sequelize.define('Medicamento', {
  nome: DataTypes.STRING,
  unidade: DataTypes.INTEGER,
  fracionavel: DataTypes.STRING,
  restricoes: DataTypes.STRING,
  dosagem: DataTypes.STRING,
  forma: DataTypes.STRING,
  quantidade: DataTypes.INTEGER,
  precoCompra: DataTypes.FLOAT,
  precoVenda: DataTypes.FLOAT,
  lote: DataTypes.STRING,
  validade: DataTypes.DATE,
  fabricante: DataTypes.STRING,
  categoria: DataTypes.STRING
});
