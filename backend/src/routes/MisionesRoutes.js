const express = require('express');
const router = express.Router();
const misionController = require('../controllers/misionController');
const authMiddleware = require('../middleware/authMiddleware');

// 🟢 Obtener todas las misiones
router.get('/', authMiddleware, misionController.getAllMissions);

// 🔵 Obtener una misión por ID
router.get('/:id', authMiddleware, misionController.getMissionById);

// 🟠 Crear una nueva misión
router.post('/', authMiddleware, misionController.createMission);

// 🟡 Actualizar una misión
router.put('/:id', authMiddleware, misionController.updateMission);

// 🔴 Eliminar una misión
router.delete('/:id', authMiddleware, misionController.deleteMission);

module.exports = router;
