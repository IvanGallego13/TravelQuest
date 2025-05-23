import express from 'express';
import { getCityFromCoordinates, getCityFromName, saveUserLocation } from '../controllers/opcional/locationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// 📌 Obtener ciudad desde coordenadas (latitud, longitud)
router.post('/from-coordinates', authMiddleware, getCityFromCoordinates);

// 📌 Buscar información de una ciudad por nombre
router.post('/from-name', authMiddleware, getCityFromName);

router.post('/user_location', saveUserLocation);

export default router;
