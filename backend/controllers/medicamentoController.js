import { Medicamento, Fornecedor } from '../models/index.js';
import { verificarEstoqueMinimo } from '../utils/stockNotifier.js';

export const listarMedicamentos = async (req, res) => {
  const meds = await Medicamento.findAll({ include: Fornecedor });
  res.json(meds);
};

export const obterMedicamento = async (req, res) => {
  const med = await Medicamento.findByPk(req.params.id);
  if (!med) return res.status(404).json({ message: 'Medicamento não encontrado' });
  res.json(med);
};

export const cadastrarMedicamento = async (req, res) => {
  const novo = await Medicamento.create(req.body);
  verificarEstoqueMinimo(novo);
  res.status(201).json(novo);
};

export const atualizarMedicamento = async (req, res) => {
  const med = await Medicamento.findByPk(req.params.id);
  if (!med) return res.status(404).json({ message: 'Medicamento não encontrado' });
  await med.update(req.body);
  verificarEstoqueMinimo(med);
  res.json(med);
};

export const deletarMedicamento = async (req, res) => {
  const med = await Medicamento.findByPk(req.params.id);
  if (!med) return res.status(404).json({ message: 'Medicamento não encontrado' });
  await med.destroy();
  res.json({ message: 'Medicamento removido com sucesso' });
};
