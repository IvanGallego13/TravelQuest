const express = require('express');
const router = express.Router();
const { getCityFromCoordinates, getCityFromName } = require('../controllers/locationController');
const authMiddleware = require('../middleware/authMiddleware');

// 📌 Obtener ciudad desde coordenadas (latitud, longitud)
router.post('/from-coordinates', authMiddleware, getCityFromCoordinates);

// 📌 Buscar información de una ciudad por nombre
router.post('/from-name', authMiddleware, getCityFromName);

module.exports = router;
