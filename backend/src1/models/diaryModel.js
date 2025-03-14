import supabase from '../config/supabaseClient.js';

export const createDiaryEntry = async (id_usuario, id_ciudad, titulo, descripcion, fecha_viaje) => {
    const { data, error } = await supabase
        .from('Diario')
        .insert([{ id_usuario, id_ciudad, titulo, descripcion, fecha_viaje }])
        .select();

    if (error) throw error;
    return data;
};

export const getDiaryEntriesByUser = async (id_usuario) => {
    const { data, error } = await supabase
        .from('Diario')
        .select('*')
        .eq('id_usuario', id_usuario);

    if (error) throw error;
    return data;
};
