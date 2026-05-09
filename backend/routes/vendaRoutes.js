import express from 'express';
import {
  listarVendas,
  registrarVenda,
  gerarRecibo
} from '../controllers/vendaController.js';

import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, listarVendas);
router.post('/', authenticate, registrarVenda);
router.get('/:id/recibo', authenticate, gerarRecibo);

export default router;
