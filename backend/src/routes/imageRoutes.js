import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/imageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

// Configuración de Multer para manejar la subida de imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 Subir una imagen a Supabase Storage (protegido)
router.post('/upload', authMiddleware, upload.single('image'), uploadImage);

export default router;
