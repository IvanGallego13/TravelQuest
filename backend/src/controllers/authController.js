import { supabase } from '../config/supabase.js';

/**
 * Registro de usuario con Supabase Auth
 */
export const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Crear cuenta
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        // 2. Iniciar sesión automáticamente
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;

        // 3. Enviar token (esto es lo que el frontend espera)
        res.status(201).json({ token: data.session.access_token });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Inicio de sesión con Supabase Auth
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Verificar sesión de usuario con token de Supabase
 */
export const getProfile = async (req, res) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1]; // Extrae el token de Bearer

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const { data, error } = await supabase.auth.getUser(token);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Cerrar sesión de usuario
 */
export const logout = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        res.status(200).json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Actualizar perfil
 */
export const updateProfile = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data, error } = await supabase.auth.updateUser({
            email,
            password
        });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
