import express from 'express';
import { userController } from '../controllers/usuarioController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

// 🟢 Registro de usuario
router.post('/register', userController.registerUser);

// 🔵 Login de usuario
router.post('/login', userController.loginUser);

// 🟠 Obtener perfil del usuario autenticado
router.get('/profile', authMiddleware, userController.getUserProfile);

// 🔵 Obtener todos los usuarios (solo admin)
router.get('/', authMiddleware, userController.getAllUsers);

// 🟡 Obtener usuario por ID
router.get('/:id', authMiddleware, userController.getUserById);

// 🟣 Actualizar usuario (autenticado o admin)
router.put('/:id', authMiddleware, userController.updateUser);

// 🔴 Eliminar usuario (admin o usuario propio)
router.delete('/:id', authMiddleware, userController.deleteUser);

export default router;
