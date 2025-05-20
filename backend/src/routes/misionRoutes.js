import express from 'express';
import { 
    generateNewMission,
    getMissionsForUser,
    updateUserMissionStatus,
    validateMissionImage,
    getMissionHistory,
    checkUserAchievements // Fixed: removed nested import and added directly to the list
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
router.get("/:id/historia", getMissionHistory)

// Add this route
router.post('/logros/check-all', authMiddleware, checkUserAchievements);

export default router;
