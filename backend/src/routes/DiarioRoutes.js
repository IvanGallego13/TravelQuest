import express from 'express';
import { 
    createOrAppendJournalEntry,
    getJournalSummary,
    createDiario, 
    getAllDiarios, 
    getDiariosByLocation,
    updateDiario, 
    deleteDiario 
} from '../controllers/diarioController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-or-append', authMiddleware,createOrAppendJournalEntry);
router.get('/resumen',authMiddleware, getJournalSummary);

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todas las entradas agrupadas por localización
router.get('/', getAllDiarios);

// Obtener entradas por localización
router.get('/ciudad/:ciudad', getDiariosByLocation);

// Crear nueva entrada
router.post('/', createDiario);

// Actualizar entrada
router.put('/:id', updateDiario);

// Eliminar entrada
router.delete('/:id', deleteDiario);

export default router;
