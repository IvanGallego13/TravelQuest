import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getUserAchievements } from '../controllers/logroController.js';

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

export default router; 