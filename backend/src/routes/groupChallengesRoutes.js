import express from 'express';
import { 
  createGroupChallenge,
  generateMissionsForGroup
} from '../controllers/groupChallenges.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { joinGroupChallenge } from '../controllers/groupChallenges.js';
import { getGroupChallengeMissions } from '../controllers/groupChallenges.js';
import { updateGroupMissionStatus } from '../controllers/groupChallenges.js';


const router = express.Router();

// Todas las rutas de retos grupales requieren autenticación
router.use(authMiddleware);

// Crear nuevo reto grupal
router.post('/create', createGroupChallenge);

// Generar misiones para un reto grupal existente
router.post('/:id/generate-missions', generateMissionsForGroup);

router.post('/join', joinGroupChallenge);
router.get('/:id/missions', getGroupChallengeMissions);
router.patch('/:challengeId/missions/:missionId', updateGroupMissionStatus);

export default router;

