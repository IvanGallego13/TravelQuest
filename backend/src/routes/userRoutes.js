import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { refreshUserLevel } from '../controllers/userController.js';

const router = express.Router();

// Ruta para actualizar manualmente el nivel del usuario
router.get('/refresh-level', authMiddleware, refreshUserLevel);

export default router;