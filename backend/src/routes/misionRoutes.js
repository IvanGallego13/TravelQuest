import express from 'express';
import { 
    generateNewMission,
    getMissionsForUser,
    updateUserMissionStatus,
    validateMissionImage,
    getMissionHistory,
} from '../controllers/misionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de misiones
router.post('/generate', generateNewMission);
router.post('/:missionId/validate-image', validateMissionImage);
router.patch('/usuario/:missionId', updateUserMissionStatus);
router.get("/mine", getMissionsForUser);
router.get("/:id/historia")

export default router;
