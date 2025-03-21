const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Crear cliente de Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * Registra un nuevo usuario en Supabase Auth
 * @param {string} email
 * @param {string} password
 * @returns {Object} Usuario autenticado o error
 */
const registerUser = async (email, password) => {
    const { user, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        throw new Error(error.message);
    }

    return user;
};

/**
 * Inicia sesión en Supabase Auth
 * @param {string} email
 * @param {string} password
 * @returns {Object} Token de sesión o error
 */
const loginUser = async (email, password) => {
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
const getUserFromToken = async (token) => {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
        return null;
    }

    return data.user;
};

module.exports = { registerUser, loginUser, getUserFromToken };
