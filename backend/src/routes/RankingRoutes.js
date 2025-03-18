const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const authMiddleware = require('../middleware/authMiddleware');

// 🟢 Obtener ranking de viajeros
router.get('/', authMiddleware, rankingController.getRanking);

// 🔵 Obtener detalles del ranking por ID
router.get('/:id', authMiddleware, rankingController.getRankingById);

module.exports = router;
