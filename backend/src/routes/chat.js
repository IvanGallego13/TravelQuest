import express from 'express';
import { 
  getChats, 
  getChatById, 
  createChat, 
  updateChat, 
  deleteChat 
} from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', getChats);
router.get('/:id', getChatById);
router.post('/', createChat);
router.put('/:id', updateChat);
router.delete('/:id', deleteChat);

export default router;
