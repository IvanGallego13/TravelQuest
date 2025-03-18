const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware para autenticación

// 🟢 Registro de usuario
router.post('/register', usuarioController.registerUser);

// 🔵 Login de usuario
router.post('/login', usuarioController.loginUser);

// 🟠 Obtener perfil del usuario autenticado
router.get('/profile', authMiddleware, usuarioController.getUserProfile);

// 🔵 Obtener todos los usuarios (solo admin)
router.get('/', authMiddleware, usuarioController.getAllUsers);

// 🟡 Obtener usuario por ID
router.get('/:id', authMiddleware, usuarioController.getUserById);

// 🟣 Actualizar usuario (autenticado o admin)
router.put('/:id', authMiddleware, usuarioController.updateUser);

// 🔴 Eliminar usuario (admin o usuario propio)
router.delete('/:id', authMiddleware, usuarioController.deleteUser);

module.exports = router;
