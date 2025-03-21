import supabase from '../config/supabaseClient.js';

export const createUser = async (nombre, correo, contraseña, foto_perfil, ultima_ubicacion, nivel, estado) => {
    const { data, error } = await supabase
        .from('Usuario')
        .insert([{ nombre, correo, contraseña, foto_perfil, ultima_ubicacion, nivel, estado }])
        .select();

    if (error) throw error;
    return data;
};

export const getUserById = async (id_usuario) => {
    const { data, error } = await supabase
        .from('Usuario')
        .select('*')
        .eq('id_usuario', id_usuario)
        .single();

    if (error) throw error;
    return data;
};
