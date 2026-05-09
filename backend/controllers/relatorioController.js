import { Venda, ItemVenda, Medicamento } from '../models/index.js';
import { Op } from 'sequelize';

export const relatorioLucro = async (req, res) => {
  const { inicio, fim } = req.query;

  const vendas = await Venda.findAll({
    where: {
      data: {
        [Op.between]: [new Date(inicio), new Date(fim)]
      }
    },
    include: {
      model: ItemVenda,
      include: Medicamento
    }
  });

  let lucroTotal = 0;

  vendas.forEach(venda => {
    venda.ItemVenda.forEach(item => {
      const custo = item.quantidade * item.Medicamento.precoCompra;
      const vendaValor = item.quantidade * item.precoUnitario;
      lucroTotal += (vendaValor - custo);
    });
  });

  res.json({
    periodo: `${inicio} até ${fim}`,
    lucro: lucroTotal.toFixed(2)
  });
};
