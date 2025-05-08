import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getUserAchievements, checkAndAwardAchievements } from '../controllers/logroController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los logros disponibles
router.get('/', async (req, res) => {
    try {
        // Return all available achievements from LOGROS object
        const { LOGROS } = await import('../controllers/logroController.js');
        const logros = Object.values(LOGROS);
        res.json(logros);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al obtener los logros',
            error: error.message 
        });
    }
});

// Obtener los logros del usuario autenticado
router.get('/mis-logros', async (req, res) => {
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

// Verificar y otorgar logros al usuario
router.post('/check', async (req, res) => {
    try {
        const userId = req.user.id;
        const { action, data } = req.body;
        
        if (!action) {
            return res.status(400).json({ 
                message: 'Se requiere una acción para verificar logros' 
            });
        }
        
        const newAchievements = await checkAndAwardAchievements(userId, action, data);
        
        res.json({
            success: true,
            message: newAchievements.length > 0 ? 'Nuevos logros desbloqueados' : 'No hay nuevos logros',
            achievements: newAchievements
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al verificar logros',
            error: error.message 
        });
    }
});

export default router;