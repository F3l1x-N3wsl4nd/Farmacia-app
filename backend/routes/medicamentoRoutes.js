import express from 'express';
import {
  listarMedicamentos,
  obterMedicamento,
  cadastrarMedicamento,
  atualizarMedicamento,
  deletarMedicamento
} from '../controllers/medicamentoController.js';

import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', authenticate, listarMedicamentos);
router.get('/:id', authenticate, obterMedicamento);
router.post('/', authenticate, authorize(['admin']), cadastrarMedicamento);
router.put('/:id', authenticate, authorize(['admin']), atualizarMedicamento);
router.delete('/:id', authenticate, authorize(['admin']), deletarMedicamento);

export default router;
