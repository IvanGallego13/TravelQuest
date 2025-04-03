import express from 'express';
import { getGlobalRanking, getFriendsRanking, updateUserPoints } from '../controllers/opcional/rankingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🟢 Obtener ranking global
router.get('/', authMiddleware, getGlobalRanking);

// 🔵 Obtener ranking de amigos
router.get('/friends/:id_usuario', authMiddleware, getFriendsRanking);

// 🟠 Actualizar puntos de usuario
router.put('/points/:id_usuario', authMiddleware, updateUserPoints);

export default router;
