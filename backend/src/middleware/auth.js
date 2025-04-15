import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Crear cliente de Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Registra un nuevo usuario en Supabase Auth
 * @param {string} email
 * @param {string} password
 * @returns {Object} Usuario autenticado o error
 */
export const registerUser = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

/**
 * Inicia sesión en Supabase Auth
 * @param {string} email
 * @param {string} password
 * @returns {Object} Token de sesión o error
 */
export const loginUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

/**
 * Obtiene el usuario autenticado desde el token
 * @param {string} token
 * @returns {Object} Usuario o null
 */
export const getUserFromToken = async (token) => {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
        return null;
    }
    console.log("🔐 Token decodificado:", data.user);

    return data.user;
};

