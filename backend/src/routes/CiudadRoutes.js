const express = require('express');
const router = express.Router();
const ciudadController = require('../controllers/ciudadController');
const authMiddleware = require('../middleware/authMiddleware');

// 🟢 Obtener lista de ciudades
router.get('/', authMiddleware, ciudadController.getAllCities);

// 🔵 Obtener información de una ciudad por ID
router.get('/:id', authMiddleware, ciudadController.getCityById);

// 🟠 Agregar una nueva ciudad
router.post('/', authMiddleware, ciudadController.createCity);

// 🟡 Actualizar información de una ciudad
router.put('/:id', authMiddleware, ciudadController.updateCity);

// 🔴 Eliminar una ciudad
router.delete('/:id', authMiddleware, ciudadController.deleteCity);

module.exports = router;
