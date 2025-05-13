import express from 'express';
import { getGlobalRanking, getUserRankingPosition } from '../controllers/rankingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get global ranking
router.get('/', getGlobalRanking);

// Get user's position in the ranking
router.get('/position', getUserRankingPosition);

export default router;
