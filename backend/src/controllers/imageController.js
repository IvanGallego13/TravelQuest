import supabase from '../config/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Subir una imagen a Supabase Storage
 */
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha enviado ninguna imagen.' });
        }

        const { originalname, buffer, mimetype } = req.file;
        const fileExt = originalname.split('.').pop();
        const fileName = `uploads/${uuidv4()}.${fileExt}`;
        const bucket = process.env.SUPABASE_BUCKET;

        // Subir imagen a Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, buffer, { contentType: mimetype });

        if (error) throw error;

        // Obtener URL pública
        const publicURL = `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;

        return res.json({ message: 'Imagen subida correctamente', url: publicURL });
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        res.status(500).json({ error: 'Error subiendo la imagen.' });
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
