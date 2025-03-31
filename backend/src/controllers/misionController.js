import { generateMission } from '../ia/generateMission.js';
import supabase from '../config/supabaseClient.js';

/**
 * Genera y agrega una nueva misión para un usuario usando OpenAI
 */
export const generateNewMission = async (req, res) => {
    try {
        const { ciudad, dificultad } = req.body;
        
        if (!ciudad || !dificultad) {
            return res.status(400).json({ 
                message: 'La ciudad y la dificultad son requeridas' 
            });
        }

        // Validar que la dificultad sea válida
        if (!['facil', 'medio', 'dificil'].includes(dificultad)) {
            return res.status(400).json({
                message: 'La dificultad debe ser: facil, medio o dificil'
            });
        }

        // Generar la misión usando OpenAI
        const missionData = await generateMission(ciudad, dificultad);

        // Guardar la misión en la base de datos
        const { data, error } = await supabase
            .from('Historial_Misiones')
            .insert([{
                id_usuario: req.user.id,
                descripcion_mision: missionData.descripcion,
                ubicacion: ciudad,
                dificultad: dificultad,
                completada: false
            }])
            .select();

        if (error) throw error;

        res.status(201).json({ 
            message: 'Misión generada y creada correctamente', 
            data 
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error al generar la misión',
            error: error.message 
        });
    }
};

/**
 * Agregar una nueva misión manualmente para un usuario
 */
export const addMission = async (req, res) => {
    const { id_usuario, descripcion_mision, ubicacion, dificultad } = req.body;

    // Validar que la dificultad sea válida
    if (!['facil', 'medio', 'dificil'].includes(dificultad)) {
        return res.status(400).json({
            message: 'La dificultad debe ser: facil, medio o dificil'
        });
    }

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .insert([{ 
            id_usuario, 
            descripcion_mision, 
            ubicacion, 
            dificultad,
            completada: false
        }])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: 'Misión creada correctamente', data });
};

/**
 * Obtener todas las misiones de un usuario
 */
export const getMissions = async (req, res) => {
    const { id_usuario } = req.params;

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .select('*')
        .eq('id_usuario', id_usuario)
        .order('fecha_generación', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};

/**
 * Obtener una misión específica por ID
 */
export const getMissionById = async (req, res) => {
    const { id_historial_misiones } = req.params;

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .select('*')
        .eq('id_historial_misiones', id_historial_misiones)
        .single();

    if (error) return res.status(404).json({ message: 'Misión no encontrada' });

    res.json(data);
};

/**
 * Actualizar una misión
 */
export const updateMission = async (req, res) => {
    const { id_historial_misiones } = req.params;
    const { descripcion_mision, ubicacion, dificultad, completada } = req.body;

    // Validar que la dificultad sea válida si se proporciona
    if (dificultad && !['facil', 'medio', 'dificil'].includes(dificultad)) {
        return res.status(400).json({
            message: 'La dificultad debe ser: facil, medio o dificil'
        });
    }

    const updateData = {};
    if (descripcion_mision) updateData.descripcion_mision = descripcion_mision;
    if (ubicacion) updateData.ubicacion = ubicacion;
    if (dificultad) updateData.dificultad = dificultad;
    if (typeof completada === 'boolean') updateData.completada = completada;

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .update(updateData)
        .eq('id_historial_misiones', id_historial_misiones)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Misión actualizada correctamente', data });
};

/**
 * Actualizar el estado de completado de una misión
 */
export const updateMissionStatus = async (req, res) => {
    const { id_historial_misiones } = req.params;
    const { completada } = req.body;

    if (typeof completada !== 'boolean') {
        return res.status(400).json({
            message: 'El estado completada debe ser un valor booleano'
        });
    }

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .update({ completada })
        .eq('id_historial_misiones', id_historial_misiones)
        .eq('id_usuario', req.user.id) // Asegurar que la misión pertenece al usuario
        .select();

    if (error) {
        return res.status(404).json({ 
            message: 'Misión no encontrada o no tienes permiso para actualizarla' 
        });
    }

    res.json({
        message: 'Estado de la misión actualizado',
        data
    });
};

/**
 * Eliminar una misión
 */
export const deleteMission = async (req, res) => {
    const { id_historial_misiones } = req.params;

    const { error } = await supabase
        .from('Historial_Misiones')
        .delete()
        .eq('id_historial_misiones', id_historial_misiones);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Misión eliminada correctamente' });
};
