import { sequelize } from '../config/db.js';
import { User } from './User.js';
import { Medicamento } from './Medicamento.js';
import { Venda } from './Venda.js';
import { ItemVenda } from './ItemVenda.js';
import { Fornecedor } from './Fornecedor.js';

User.hasMany(Venda);
Venda.belongsTo(User);
Venda.hasMany(ItemVenda);
ItemVenda.belongsTo(Venda);

Medicamento.hasMany(ItemVenda);
ItemVenda.belongsTo(Medicamento);

Fornecedor.hasMany(Medicamento);
Medicamento.belongsTo(Fornecedor);

export {
  sequelize,
  User,
  Medicamento,
  Venda,
  ItemVenda,
  Fornecedor
};
