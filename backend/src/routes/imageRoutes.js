const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage } = require('../controllers/imageController');
const authMiddleware = require('../middleware/authMiddleware');

// Configuración de Multer para manejar la subida de imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 Subir una imagen a Supabase Storage (protegido)
router.post('/upload', authMiddleware, upload.single('image'), uploadImage);

module.exports = router;
