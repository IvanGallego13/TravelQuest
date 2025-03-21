const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');
const authMiddleware = require('../middleware/authMiddleware');

// 🟢 Obtener todos los mensajes entre usuarios
router.get('/', authMiddleware, mensajeController.getAllMessages);

// 🔵 Obtener un mensaje por ID
router.get('/:id', authMiddleware, mensajeController.getMessageById);

// 🟠 Enviar un nuevo mensaje
router.post('/', authMiddleware, mensajeController.sendMessage);

// 🔴 Eliminar un mensaje
router.delete('/:id', authMiddleware, mensajeController.deleteMessage);

module.exports = router;
