import { supabase } from '../config/supabase.js';

/**
 * Agregar una entrada de diario
 */
export const addDiaryEntry = async (req, res) => {
    const { id_usuario, id_ciudad, titulo, descripcion, fecha_viaje } = req.body;

    const { data, error } = await supabase
        .from('Diario')
        .insert([{ id_usuario, id_ciudad, titulo, descripcion, fecha_viaje }])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: 'Diario creado correctamente', data });
};

/**
 * Obtener los diarios de un usuario
 */
export const getUserDiary = async (req, res) => {
    const { id_usuario } = req.params;

    const { data, error } = await supabase
        .from('Diario')
        .select('*')
        .eq('id_usuario', id_usuario);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};

/**
 * Actualizar una entrada de diario
 */
export const updateDiaryEntry = async (req, res) => {
    const { id_diario } = req.params;
    const { titulo, descripcion, fecha_viaje } = req.body;

    const { data, error } = await supabase
        .from('Diario')
        .update({ titulo, descripcion, fecha_viaje })
        .eq('id_diario', id_diario)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Diario actualizado correctamente', data });
};

/**
 * Eliminar una entrada de diario
 */
export const deleteDiaryEntry = async (req, res) => {
    const { id_diario } = req.params;

    const { error } = await supabase
        .from('Diario')
        .delete()
        .eq('id_diario', id_diario);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Diario eliminado correctamente' });
};

// Crear una nueva entrada en el diario
export const createDiario = async (req, res) => {
    try {
        const { contenido, ciudad } = req.body;
        const user_id = req.user.id;
        let imagen_url = null;

        // Manejar la subida de imagen si existe
        if (req.files && req.files.imagen) {
            const file = req.files.imagen;
            const { data, error: uploadError } = await supabase.storage
                .from('diario-imagenes')
                .upload(`${user_id}/${Date.now()}-${file.name}`, file.data);

            if (uploadError) throw uploadError;
            imagen_url = data.path;
        }

        // Buscar o crear la localización
        let { data: localizacion, error: locError } = await supabase
            .from('diario_localizaciones')
            .select('id')
            .eq('nombre_ciudad', ciudad)
            .eq('user_id', user_id)
            .single();

        if (!localizacion) {
            const { data: nuevaLoc, error: createLocError } = await supabase
                .from('diario_localizaciones')
                .insert([{ nombre_ciudad: ciudad, user_id }])
                .select()
                .single();

            if (createLocError) throw createLocError;
            localizacion = nuevaLoc;
        }

        // Crear la entrada del diario
        const { data: entrada, error: entradaError } = await supabase
            .from('diario_entradas')
            .insert([{
                localizacion_id: localizacion.id,
                user_id,
                contenido,
                imagen_url
            }])
            .select(`
                *,
                diario_localizaciones (
                    nombre_ciudad
                )
            `)
            .single();

        if (entradaError) throw entradaError;

        res.status(201).json(entrada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todas las entradas del diario agrupadas por localización
export const getAllDiarios = async (req, res) => {
    try {
        const user_id = req.user.id;

        const { data: localizaciones, error: locError } = await supabase
            .from('diario_localizaciones')
            .select(`
                *,
                diario_entradas (
                    id,
                    contenido,
                    imagen_url,
                    fecha,
                    created_at
                )
            `)
            .eq('user_id', user_id)
            .order('created_at', { foreignTable: 'diario_entradas', ascending: false });

        if (locError) throw locError;

        res.json(localizaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener entradas por localización
export const getDiariosByLocation = async (req, res) => {
    try {
        const { ciudad } = req.params;
        const user_id = req.user.id;

        const { data, error } = await supabase
            .from('diario_localizaciones')
            .select(`
                *,
                diario_entradas (
                    id,
                    contenido,
                    imagen_url,
                    fecha,
                    created_at
                )
            `)
            .eq('nombre_ciudad', ciudad)
            .eq('user_id', user_id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una entrada del diario
export const updateDiario = async (req, res) => {
    try {
        const { id } = req.params;
        const { contenido } = req.body;
        const user_id = req.user.id;

        let updates = { contenido };

        // Actualizar imagen si se proporciona una nueva
        if (req.files && req.files.imagen) {
            const file = req.files.imagen;
            const { data, error: uploadError } = await supabase.storage
                .from('diario-imagenes')
                .upload(`${user_id}/${Date.now()}-${file.name}`, file.data);

            if (uploadError) throw uploadError;
            updates.imagen_url = data.path;
        }

        const { data, error } = await supabase
            .from('diario_entradas')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user_id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una entrada del diario
export const deleteDiario = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const { error } = await supabase
            .from('diario_entradas')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id);

        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
