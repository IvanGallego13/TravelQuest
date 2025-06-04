import express from 'express';
import * as conversationController from '../controllers/conversationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas (sin autenticación requerida, para desarrollo)
router.post('/', conversationController.createConversation);
router.get('/details/:id', conversationController.getConversationDetails);
router.get('/user/:userId', conversationController.getUserConversations);
router.get('/:userId', conversationController.getUserConversations);

// DEBUG: Ruta temporal para listar todas las conversaciones
router.get('/debug/all', conversationController.debugListAllConversations);

// Rutas para aceptar y rechazar conversaciones (requieren autenticación)
router.put('/:id/accept', authMiddleware, conversationController.acceptConversation);
router.put('/:id/reject', authMiddleware, conversationController.rejectConversation);
router.delete('/:id', authMiddleware, conversationController.deleteConversation);

// También podríamos agregar versiones protegidas:
// router.post('/', authMiddleware, conversationController.createConversation);
// router.get('/details/:id', authMiddleware, conversationController.getConversationDetails);
// router.get('/user/:userId', authMiddleware, conversationController.getUserConversations);

export default router; 