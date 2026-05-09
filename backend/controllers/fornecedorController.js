import { Fornecedor } from '../models/index.js';

export const listarFornecedores = async (req, res) => {
  const fornecedores = await Fornecedor.findAll();
  res.json(fornecedores);
};

export const cadastrarFornecedor = async (req, res) => {
  const novo = await Fornecedor.create(req.body);
  res.status(201).json(novo);
};

export const atualizarFornecedor = async (req, res) => {
  const fornecedor = await Fornecedor.findByPk(req.params.id);
  if (!fornecedor) return res.status(404).json({ message: 'Fornecedor não encontrado' });

  await fornecedor.update(req.body);
  res.json(fornecedor);
};

export const deletarFornecedor = async (req, res) => {
  const fornecedor = await Fornecedor.findByPk(req.params.id);
  if (!fornecedor) return res.status(404).json({ message: 'Fornecedor não encontrado' });

  await fornecedor.destroy();
  res.json({ message: 'Fornecedor removido com sucesso' });
};
