import { Venda, ItemVenda, Medicamento, User } from '../models/index.js';
import { gerarReciboVenda } from '../utils/pdfGenerator.js';

export const listarVendas = async (req, res) => {
  const vendas = await Venda.findAll({ include: [ItemVenda, User] });
  res.json(vendas);
};

export const registrarVenda = async (req, res) => {
  try {
    const { cliente,funcionario, metodoPagamento, itens } = req.body;
    console.log(" Dados recebidos:", req.body);

    let total = 0;

    for (const item of itens) {
      // Aceita tanto item.medicamentoId quanto item.id
      const medicamentoId = item.medicamentoId || item.id;

      const med = await Medicamento.findByPk(medicamentoId);
   

      if (!med) return res.status(400).json({ message: 'Medicamento inválido' });

      if (new Date(med.validade) < new Date()) {
        return res.status(400).json({ message: `Medicamento vencido: ${med.nome}` });
      }

      if (med.quantidade < item.quantidade) {
        return res.status(400).json({ message: `Estoque insuficiente para ${med.nome}` });
      }

      total += item.quantidade * med.precoVenda;
    }

    const venda = await Venda.create({
      cliente,
      funcionario,
      metodoPagamento,
      total,
      data: new Date(),
      UserId: req.user.id
    });

    for (const item of itens) {
      const medicamentoId = item.medicamentoId || item.id;

      const med = await Medicamento.findByPk(medicamentoId);
      await med.update({ quantidade: med.quantidade - item.quantidade });

      await ItemVenda.create({
        quantidade: item.quantidade,
        precoUnitario: med.precoVenda,
        MedicamentoId: medicamentoId,
        VendaId: venda.id
      });
    }

    res.status(201).json({ message: 'Venda registrada', vendaId: venda.id });
  } catch (err) {
    
    console.error(" Erro registrarVenda:", err);
    res.status(500).json({ message: "Erro interno ao registrar venda" });
  }
};

export const gerarRecibo = async (req, res) => {
  try {
    const venda = await Venda.findByPk(req.params.id, {
      include: [{ model: ItemVenda, include: Medicamento }]
    });

    if (!venda) return res.status(404).json({ message: 'Venda não encontrada' });

    const recibo = {
      itens: venda.ItemVenda.map(iv => ({
        nome: iv.Medicamento.nome,
        quantidade: iv.quantidade,
        precoUnitario: iv.precoUnitario
      })),
      total: venda.total
    };

    gerarReciboVenda(recibo, res);
  } catch (err) {
    console.error(" Erro gerarRecibo:", err);
    res.status(500).json({ message: "Erro interno ao gerar recibo" });
  }
};
