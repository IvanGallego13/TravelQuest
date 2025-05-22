import express from 'express';
import * as mensajeController from '../controllers/mensajeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas (sin autenticación requerida, para desarrollo)
router.post('/', mensajeController.sendMessage);
router.get('/:conversationId', mensajeController.getConversationMessages);
router.put('/:messageId/read', mensajeController.markMessageAsRead);
router.delete('/:messageId', mensajeController.deleteMessage);

// También podríamos agregar versiones protegidas:
// router.post('/', authMiddleware, mensajeController.sendMessage);
// router.get('/:conversationId', authMiddleware, mensajeController.getConversationMessages);
// etc.

export default router;
