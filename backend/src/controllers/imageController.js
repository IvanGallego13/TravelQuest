import { supabase } from '../config/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

/**
 * Sube una imagen a Supabase Storage
 */
export const uploadImage = async (req, res) => {
    try {
        console.log("📦 Recibiendo solicitud de subida de imagen");
        console.log("📦 req.files:", req.files);
        console.log("📦 req.file:", req.file);
        
        let imageFile;
        
        // Check if image is in req.files (express-fileupload)
        if (req.files && req.files.image) {
            imageFile = req.files.image;
            console.log("📸 Imagen recibida via express-fileupload:", imageFile.name, "Tamaño:", imageFile.size);
        } 
        // Check if image is in req.file (multer)
        else if (req.file) {
            imageFile = req.file;
            console.log("📸 Imagen recibida via multer:", imageFile.originalname, "Tamaño:", imageFile.size);
        } 
        else {
            console.log("❌ No se encontró ninguna imagen en la solicitud");
            return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
        }

        // Generate a unique filename
        const fileExt = imageFile.name ? path.extname(imageFile.name) : path.extname(imageFile.originalname || '.jpg');
        const fileName = `${uuidv4()}${fileExt}`;
        const filePath = `${req.user.id}/${fileName}`;

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        let fileBuffer;
        
        // Handle different file upload libraries
        if (imageFile.mv) {
            // express-fileupload
            const tempPath = path.join(process.cwd(), 'uploads', fileName);
            await imageFile.mv(tempPath);
            console.log("✅ Archivo guardado temporalmente en:", tempPath);
            fileBuffer = fs.readFileSync(tempPath);
            // Clean up temp file
            fs.unlinkSync(tempPath);
        } else if (imageFile.buffer) {
            // multer
            fileBuffer = imageFile.buffer;
        } else {
            return res.status(400).json({ error: 'Formato de archivo no soportado' });
        }

        // Upload to Supabase
        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, fileBuffer, {
                contentType: imageFile.mimetype || 'image/jpeg',
                upsert: true
            });

        if (error) {
            console.error("❌ Error de Supabase:", error);
            throw error;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        console.log("🔗 URL pública generada:", publicUrl);

        res.status(200).json({
            message: 'Imagen subida correctamente',
            url: publicUrl
        });

    } catch (error) {
        console.error('Error al subir la imagen:', error);
        res.status(500).json({ error: 'Error al subir la imagen' });
    }
};

/**
 * Obtener la URL de una imagen subida
 */
export const getImageURL = async (req, res) => {
    const { imagePath } = req.params;
    const bucket = process.env.SUPABASE_BUCKET;

    const publicURL = `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${imagePath}`;
    res.json({ url: publicURL });
};

/**
 * Eliminar una imagen de Supabase Storage
 */
export const deleteImage = async (req, res) => {
    const { imagePath } = req.params;
    const bucket = process.env.SUPABASE_BUCKET;

    const { error } = await supabase.storage
        .from(bucket)
        .remove([imagePath]);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Imagen eliminada correctamente' });
};
