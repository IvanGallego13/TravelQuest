import express from 'express';
import { 
  createOrAssignGroupChallenge
} from '../controllers/groupChallenges.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { joinGroupChallenge } from '../controllers/groupChallenges.js';
import { getGroupChallengeMissions } from '../controllers/groupChallenges.js';
import { updateGroupMissionStatus } from '../controllers/groupChallenges.js';
import { getActiveGroupChallenge } from "../controllers/groupChallenges.js";
import { deleteActiveGroupChallenge } from "../controllers/groupChallenges.js";
import { getGroupChallengeById } from '../controllers/groupChallenges.js';



const router = express.Router();

// Todas las rutas de retos grupales requieren autenticación
router.use(authMiddleware);

// Crear nuevo reto grupal
router.post('/create', createOrAssignGroupChallenge);


router.post('/join', joinGroupChallenge);
router.get('/:id/missions', getGroupChallengeMissions);
router.patch('/:challengeId/missions/:missionId', updateGroupMissionStatus);
router.get('/:id', getGroupChallengeById);
router.get("/active", getActiveGroupChallenge);
router.delete("/active", deleteActiveGroupChallenge);


export default router;

