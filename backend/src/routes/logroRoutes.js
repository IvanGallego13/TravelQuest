import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
  getUserAchievements, 
  getAllAchievements,
  checkAndAwardAchievements 
} from '../controllers/logrocontroller.js';

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

// Fix the check-all endpoint to use our own function instead of importing from misionController
router.post('/check-all', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        if (!userId) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }
        
        // Use the checkAndAwardAchievements function directly
        const achievements = await checkAndAwardAchievements(userId, 'CHECK_ALL');
        
        // Return the achievements to the client
        res.status(200).json({ 
            message: "Logros verificados correctamente",
            newAchievements: achievements?.newAchievements || [],
            pointsEarned: achievements?.pointsEarned || 0
        });
    } catch (error) {
        console.error("Error checking achievements:", error);
        res.status(500).json({ error: "Error al verificar logros" });
    }
});

export default router;