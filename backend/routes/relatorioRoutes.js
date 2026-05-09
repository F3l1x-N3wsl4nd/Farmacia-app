import express from 'express';
import { relatorioLucro } from '../controllers/relatorioController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/lucro', authenticate, authorize(['admin']), relatorioLucro);

export default router;
