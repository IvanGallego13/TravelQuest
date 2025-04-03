import { supabase } from '../config/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sube una imagen a Supabase Storage
 */
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${req.user.id}/${fileName}`;

        // Subir la imagen a Supabase Storage
        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) throw error;

        // Obtener la URL pública de la imagen
        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

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
