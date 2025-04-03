import express from 'express';
import { amigosController } from '../controllers/opcional/amigosController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🟢 Obtener lista de amigos
router.get('/', authMiddleware, amigosController.getAllFriends);

// 🔵 Obtener un amigo por ID
router.get('/:id', authMiddleware, amigosController.getFriendById);

// 🟠 Enviar solicitud de amistad
router.post('/', authMiddleware, amigosController.sendFriendRequest);

// 🟡 Aceptar solicitud de amistad
router.put('/:id/accept', authMiddleware, amigosController.acceptFriendRequest);

// 🔴 Eliminar un amigo
router.delete('/:id', authMiddleware, amigosController.deleteFriend);

export default router;
