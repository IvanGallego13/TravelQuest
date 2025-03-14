import supabase from '../config/supabaseClient.js';

export const uploadImage = async (req, res) => {
    const { file } = req;

    if (!file) return res.status(400).json({ error: 'No se proporcionó una imagen' });

    const { data, error } = await supabase.storage
        .from('images')
        .upload(`uploads/${Date.now()}_${file.originalname}`, file.buffer, {
            contentType: file.mimetype
        });

    if (error) return res.status(500).json({ error: error.message });

    const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.path}`;

    res.json({ message: 'Imagen subida correctamente', imageUrl });
};
