import express from 'express';
import {
  obterFuncionario,
  listarFuncionario,
  atualizarFuncionario,
  deletarFuncionanario,
} from '../controllers/funcionarioController.js';

import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', authenticate, obterFuncionario);
router.get('/:id', authenticate, listarFuncionario);
//router.post('/', authenticate, authorize(['admin']), cadastrarMedicamento);
router.put('/:id', authenticate, authorize(['admin']), atualizarFuncionario);
router.delete('/:id', authenticate, authorize(['admin']), deletarFuncionanario);

export default router;
