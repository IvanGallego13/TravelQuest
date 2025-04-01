import express from 'express';
import { 
    getAllMisiones, 
    getMisionById, 
    createMision, 
    updateMision, 
    deleteMision,
    validarImagenMision
} from '../controllers/misionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// 🟢 Obtener todas las misiones
router.get('/', getAllMisiones);

// 🔵 Obtener una misión por ID
router.get('/:id', getMisionById);

// 🟠 Crear una nueva misión
router.post('/', createMision);

// 🟡 Actualizar una misión
router.put('/:id', updateMision);

// 🔴 Eliminar una misión
router.delete('/:id', deleteMision);

// Nueva ruta para validar imágenes
router.post('/:misionId/validar-imagen', validarImagenMision);

export default router;
