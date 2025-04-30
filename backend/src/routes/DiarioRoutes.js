import express from 'express';
import { 
    createOrAppendJournalEntry,
    getJournalSummary,
    getTravelDaysByBook
} from '../controllers/diarioController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
// Todas las rutas requieren autenticación
router.use(authMiddleware);
router.post('/create-or-append',createOrAppendJournalEntry);
router.get('/resumen', getJournalSummary);
router.get('/dias/:bookId',getTravelDaysByBook)




export default router;
