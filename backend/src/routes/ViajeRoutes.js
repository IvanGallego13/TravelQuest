import express from 'express';
import { 
  getAllViajes, 
  getViajeById, 
  createViaje, 
  updateViaje, 
  deleteViaje 
} from '../controllers/viajeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', getAllViajes);
router.get('/:id', getViajeById);
router.post('/', createViaje);
router.put('/:id', updateViaje);
router.delete('/:id', deleteViaje);

export default router;
