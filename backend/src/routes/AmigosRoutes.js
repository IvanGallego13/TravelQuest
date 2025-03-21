const express = require('express');
const router = express.Router();
const amigoController = require('../controllers/amigoController');
const authMiddleware = require('../middleware/authMiddleware');

// 🟢 Obtener lista de amigos
router.get('/', authMiddleware, amigoController.getAllFriends);

// 🔵 Obtener un amigo por ID
router.get('/:id', authMiddleware, amigoController.getFriendById);

// 🟠 Enviar solicitud de amistad
router.post('/', authMiddleware, amigoController.sendFriendRequest);

// 🟡 Aceptar solicitud de amistad
router.put('/:id/accept', authMiddleware, amigoController.acceptFriendRequest);

// 🔴 Eliminar un amigo
router.delete('/:id', authMiddleware, amigoController.deleteFriend);

module.exports = router;
