import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  logout, 
  updateProfile,
  googleAuthUrl,
  oauthCallback
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.post('/register', register);
router.post('/login', login);

// Rutas para autenticación OAuth
router.get('/google/authorize', googleAuthUrl);
router.post('/oauth/callback', oauthCallback);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authMiddleware, getProfile);
router.post('/logout', authMiddleware, logout);
router.put('/profile', authMiddleware, updateProfile);

export default router; 