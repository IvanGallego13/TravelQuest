// backend/src/controllers/authController.js

import supabase from '../config/supabaseClient.js';

// Registro de usuario con Supabase Auth
export const signUp = async (req, res) => {
    const { email, password, nombre } = req.body;

    // Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    // Guardar usuario en la base de datos
    const { data: userData, error: dbError } = await supabase
        .from('Usuario')
        .insert([{ id_usuario: data.user.id, nombre, correo: email }])
        .select();

    if (dbError) return res.status(500).json({ error: dbError.message });

    res.status(201).json({ message: 'Usuario registrado', user: userData });
};

// Inicio de sesión con Supabase Auth
export const signIn = async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Inicio de sesión exitoso', data });
};

// Verificar sesión de usuario
export const getUserSession = async (req, res) => {
    const { data, error } = await supabase.auth.getUser();

    if (error) return res.status(401).json({ error: 'No hay sesión activa' });

    res.json({ user: data });
};

// Cerrar sesión
export const signOut = async (req, res) => {
    const { error } = await supabase.auth.signOut();
    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Sesión cerrada correctamente' });
};
