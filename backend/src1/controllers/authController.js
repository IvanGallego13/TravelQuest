import supabase from '../config/supabaseClient.js';

export const signUp = async (req, res) => {
    const { email, password } = req.body;

    const { user, error } = await supabase.auth.signUp({ email, password });

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: 'Usuario registrado', user });
};

export const signIn = async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Inicio de sesión exitoso', data });
};
