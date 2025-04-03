import express from 'express';
import { 
    generateNewMission,
    addMission,
    getMissions,
    getMissionById,
    updateMission,
    updateMissionStatus,
    deleteMission,
    validarImagenMission
} from '../controllers/misionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de misiones
router.get('/', getMissions);
router.get('/:id', getMissionById);
router.post('/generate', generateNewMission);
router.post('/', addMission);
router.put('/:id', updateMission);
router.put('/:id/status', updateMissionStatus);
router.delete('/:id', deleteMission);
router.post('/:id/validar-imagen', validarImagenMission);

export default router;
