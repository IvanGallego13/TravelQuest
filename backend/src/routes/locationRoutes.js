import express from 'express';
import { getCityFromCoordinates, getCityFromName } from '../controllers/opcional/locationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// 📌 Obtener ciudad desde coordenadas (latitud, longitud)
router.post('/from-coordinates', authMiddleware, getCityFromCoordinates);

// 📌 Buscar información de una ciudad por nombre
router.post('/from-name', authMiddleware, getCityFromName);

export default router;
