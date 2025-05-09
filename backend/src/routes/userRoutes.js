import express from 'express';
import { getAllUsers, getUserById, getUserProfileComplete, updateUserLevel } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Rutas protegidas (requieren autenticación)
router.get('/profile/complete', authMiddleware, getUserProfileComplete);
router.put('/level/update', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const newLevel = await updateUserLevel(userId);
        res.json({ success: true, level: newLevel });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;