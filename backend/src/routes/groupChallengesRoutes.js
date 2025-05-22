import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createOrAssignGroupChallenge,
  joinGroupChallenge,
  getGroupChallengeMissions,
  updateGroupMissionStatus,
  getActiveGroupChallenge,
  deleteActiveGroupChallenge,
  getGroupChallengeById,
  unassignGroupMission
 } from '../controllers/groupChallenges.js';




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
router.delete("/:challengeId/missions/:missionId/unassign", unassignGroupMission);


export default router;

