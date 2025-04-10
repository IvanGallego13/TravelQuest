import express from 'express';
import { obtenerAjustes, actualizarAjustes } from '../controllers/ajustesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas protegidas de perfil
router.get('/perfil', authMiddleware, obtenerAjustes);
router.put('/perfil', authMiddleware, actualizarAjustes);

export default router;
