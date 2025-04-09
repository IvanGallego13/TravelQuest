import express from 'express';
import { 
    generateNewMission,
    addMission,
    getMissionsForUser,
    validateMissionImage
} from '../controllers/misionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { updateUserMissionStatus } from '../controllers/misionController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de misiones
router.post('/generate', generateNewMission);
router.post('/', addMission);
router.post('/:missionId/validate-image', validateMissionImage);
router.patch('/usuario/:missionId', updateUserMissionStatus);
router.get("/mine", getMissionsForUser);

export default router;
