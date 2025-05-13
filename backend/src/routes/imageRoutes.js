import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/imageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

// Configuración de Multer para manejar la subida de imágenes
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware para detectar qué librería usar
const fileUploadMiddleware = (req, res, next) => {
  // Si ya hay un archivo en req.file (multer lo procesó), continuar
  if (req.file) {
    return next();
  }
  
  // Si hay archivos en req.files (express-fileupload), continuar
  if (req.files && req.files.image) {
    return next();
  }
  
  // Si no hay archivos, intentar usar multer como fallback
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error("Error en multer:", err);
      return res.status(400).json({ error: 'Error al procesar la imagen' });
    }
    next();
  });
};

// 📌 Subir una imagen a Supabase Storage (protegido)
router.post('/upload', authMiddleware, fileUploadMiddleware, uploadImage);

export default router;
