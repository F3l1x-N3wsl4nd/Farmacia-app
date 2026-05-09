import { User, Fornecedor } from '../models/index.js';
import { verificarEstoqueMinimo } from '../utils/stockNotifier.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


 
export const obterFuncionario = async (req, res) => {
  const func = await User.findAll();
  if (!func) return res.status(404).json({ message: 'Funcionario não encontrado' });
  res.json(func);
};


export const listarFuncionario = async (req, res) => {
  const lista = await User.findByPk(req.params.id);
  if (!lista) return res.status(404).json({ message: 'Funcionario não encontrado' });
  res.json(lista);
};


export const atualizarFuncionario = async (req, res) =>{
  const {nome, email, senha, role} = req.body;
  const atualizar = await User.findByPk(req.params.id);
  
  const senhaHash = await bcrypt.hash(senha, 10);
  if(!atualizar) return res.status(404).json({message: 'Funcionario nao encontrado!'});
  await atualizar.update({nome, email, senha:senhaHash, role});
  res.json(atualizar);
}


export const deletarFuncionanario = async (req, res)=>{

  const deletar = await User.findByPk(req.params.id);
    if(!deletar) return res.status(404).json({message: 'Funcionario nao detecatado'});
   await deletar.destroy();
   res.json({message: 'Funcionario removido com sucesso'});
} 