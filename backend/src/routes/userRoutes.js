import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/', userController.getAllUsers);
router.get('/username/:username', userController.getUserByUsername);
router.get('/:id', userController.getUserById);

// Rutas protegidas (requieren autenticación)
router.get('/profile/complete', authMiddleware, userController.getUserProfileComplete);
router.put('/level/update', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const newLevel = await userController.updateUserLevel(userId);
        res.json({ success: true, level: newLevel });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener datos de varios usuarios por sus IDs
router.post('/bulk', userController.getUsersBulk);

export default router;