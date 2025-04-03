import express from 'express';
import * as mensajeController from '../controllers/opcional/mensajeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🟢 Obtener mensajes entre dos usuarios
router.get('/:id_emisor/:id_receptor', authMiddleware, mensajeController.getMessages);

// 🟠 Enviar un nuevo mensaje
router.post('/', authMiddleware, mensajeController.sendMessage);

// 🔵 Marcar mensaje como leído
router.put('/:id_mensaje/read', authMiddleware, mensajeController.markMessageAsRead);

// 🔴 Eliminar un mensaje
router.delete('/:id_mensaje', authMiddleware, mensajeController.deleteMessage);

export default router;
