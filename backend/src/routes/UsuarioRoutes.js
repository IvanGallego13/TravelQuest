import express from 'express';
import { userController } from '../controllers/usuarioController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { isAdmin, isOwnerOrAdmin } from '../middleware/roleMiddleware.js';
import { validateRegister, validateLogin, validateUpdateUser } from '../middleware/validators.js';

const router = express.Router();

// 🟢 Registro de usuario
router.post('/register', validateRegister, userController.registerUser);

// 🔵 Login de usuario
router.post('/login', validateLogin, userController.loginUser);

// 🟠 Obtener perfil del usuario autenticado
router.get('/profile', authMiddleware, userController.getUserProfile);

// 🔵 Obtener todos los usuarios (solo admin)
router.get('/', authMiddleware, isAdmin, userController.getAllUsers);

// 🟡 Obtener usuario por ID
router.get('/:id', authMiddleware, userController.getUserById);

// 🟣 Actualizar usuario (autenticado o admin)
router.put('/:id', authMiddleware, isOwnerOrAdmin, validateUpdateUser, userController.updateUser);

// 🔴 Eliminar usuario (admin o usuario propio)
router.delete('/:id', authMiddleware, isOwnerOrAdmin, userController.deleteUser);

export default router;
