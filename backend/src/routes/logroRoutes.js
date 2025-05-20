import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
  getUserAchievements, 
  getAllAchievements, // Add this import
  checkAndAwardAchievements 
} from '../controllers/logrocontroller.js';
import { checkUserAchievements } from '../controllers/misionController.js';

const router = express.Router();

// Obtener logros del usuario
router.get('/mis-logros', authMiddleware, async (req, res) => {
    try {
        const logros = await getUserAchievements(req.user.id);
        res.json(logros);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al obtener los logros',
            error: error.message 
        });
    }
});

// Add this route to get all achievements
router.get('/', authMiddleware, getAllAchievements);

// Add this route for checking achievements
router.post('/check-all', authMiddleware, checkUserAchievements);

export default router;