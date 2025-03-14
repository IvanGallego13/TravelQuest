// backend/src/controllers/imageController.js
import supabase from "../config/dbConfig.js";
import { v4 as uuidv4 } from "uuid";

// 📌 Subir imagen a Supabase Storage
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se ha enviado ninguna imagen." });
        }

        const { originalname, buffer } = req.file;
        const fileExt = originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const bucket = process.env.SUPABASE_BUCKET;

        // Subir imagen a Supabase Storage
        const { data, error } = await supabase
            .storage
            .from(bucket)
            .upload(fileExt + "/" + fileExt, buffer, {
                contentType: req.file.mimetype,
                upsert: false, // Evita sobrescribir imágenes existentes
            });

        if (error) throw error;

        // Obtener URL pública
        const { data: publicURL } = supabase
            .storage
            .from(bucket)
            .getPublicUrl(fileExt + "/" + fileExt);

        return res.json({ url: publicURL.publicUrl });
    } catch (error) {
        console.error("Error al subir la imagen:", error);
        res.status(500).json({ error: "Error subiendo la imagen." });
    }
};
