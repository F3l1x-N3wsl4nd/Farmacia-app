import express from 'express';
import {
  listarFornecedores,
  cadastrarFornecedor,
  atualizarFornecedor,
  deletarFornecedor
} from '../controllers/fornecedorController.js';

import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', authenticate, listarFornecedores);
router.post('/', authenticate, authorize(['admin']), cadastrarFornecedor);
router.put('/:id', authenticate, authorize(['admin']), atualizarFornecedor);
router.delete('/:id', authenticate, authorize(['admin']), deletarFornecedor);

export default router;
