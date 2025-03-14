import supabase from '../config/supabaseClient.js';

export const createMission = async (id_usuario, descripcion_mision, ubicacion, dificultad) => {
    const { data, error } = await supabase
        .from('Historial_Misiones')
        .insert([{ id_usuario, descripcion_mision, ubicacion, dificultad }])
        .select();

    if (error) throw error;
    return data;
};

export const getMissionsByUser = async (id_usuario) => {
    const { data, error } = await supabase
        .from('Historial_Misiones')
        .select('*')
        .eq('id_usuario', id_usuario);

    if (error) throw error;
    return data;
};
