const express = require('express');
const router = express.Router();
const diarioController = require('../controllers/diarioController');
const authMiddleware = require('../middleware/authMiddleware');

// 🟢 Obtener todos los diarios de un usuario
router.get('/', authMiddleware, diarioController.getAllDiarios);

// 🔵 Obtener un diario por ID
router.get('/:id', authMiddleware, diarioController.getDiarioById);

// 🟠 Crear un nuevo diario
router.post('/', authMiddleware, diarioController.createDiario);

// 🟡 Actualizar un diario
router.put('/:id', authMiddleware, diarioController.updateDiario);

// 🔴 Eliminar un diario
router.delete('/:id', authMiddleware, diarioController.deleteDiario);

module.exports = router;
