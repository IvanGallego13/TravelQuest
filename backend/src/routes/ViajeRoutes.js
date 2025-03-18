const express = require('express');
const router = express.Router();
const viajeController = require('../controllers/viajeController');
const authMiddleware = require('../middleware/authMiddleware');

// 🟢 Obtener todos los viajes del usuario autenticado
router.get('/', authMiddleware, viajeController.getAllViajes);

// 🔵 Obtener un viaje por ID
router.get('/:id', authMiddleware, viajeController.getViajeById);

// 🟠 Crear un nuevo viaje
router.post('/', authMiddleware, viajeController.createViaje);

// 🟡 Actualizar un viaje
router.put('/:id', authMiddleware, viajeController.updateViaje);

// 🔴 Eliminar un viaje
router.delete('/:id', authMiddleware, viajeController.deleteViaje);

module.exports = router;
