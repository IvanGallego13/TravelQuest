import { supabase } from '../config/supabaseClient.js';
import { registerUser, loginUser, getUserFromToken } from '../middleware/auth.js';

export const userController = {
    // Registro de usuario
    registerUser: async (req, res) => {
        try {
            const { email, password, nombre } = req.body;
            const authData = await registerUser(email, password);
            
            // Crear usuario en la tabla Usuario
            const { data, error } = await supabase
                .from('Usuario')
                .insert([
                    {
                        id_usuario: authData.user.id,
                        email: email,
                        nombre: nombre,
                        nivel: 1,
                        estado: 'activo'
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            res.status(201).json({ 
                message: 'Usuario registrado exitosamente', 
                user: data 
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Login de usuario
    loginUser: async (req, res) => {
        try {
            const { email, password } = req.body;
            const authData = await loginUser(email, password);
            
            // Obtener datos adicionales del usuario
            const { data, error } = await supabase
                .from('Usuario')
                .select('*')
                .eq('id_usuario', authData.user.id)
                .single();

            if (error) throw error;

            res.json({ 
                message: 'Login exitoso', 
                auth: authData,
                user: data 
            });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    },

    // Obtener perfil del usuario autenticado
    getUserProfile: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('Usuario')
                .select('*')
                .eq('id_usuario', req.user.id)
                .single();

            if (error) throw error;
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el perfil' });
        }
    },

    // Obtener todos los usuarios (solo admin)
    getAllUsers: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('Usuario')
                .select('*');

            if (error) throw error;
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    },

    // Obtener usuario por ID
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase
                .from('Usuario')
                .select('*')
                .eq('id_usuario', id)
                .single();

            if (error) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener usuario' });
        }
    },

    // Actualizar usuario
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, foto_perfil, ultima_ubicacion, nivel, estado } = req.body;

            const { data, error } = await supabase
                .from('Usuario')
                .update({ nombre, foto_perfil, ultima_ubicacion, nivel, estado })
                .eq('id_usuario', id)
                .select()
                .single();

            if (error) throw error;

            res.json({ 
                message: 'Usuario actualizado correctamente', 
                user: data 
            });
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar usuario' });
        }
    },

    // Eliminar usuario
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            // Primero eliminar el usuario de la tabla Usuario
            const { error: dbError } = await supabase
                .from('Usuario')
                .delete()
                .eq('id_usuario', id);

            if (dbError) throw dbError;

            // Luego eliminar el usuario de Supabase Auth
            const { error: authError } = await supabase.auth.admin.deleteUser(id);
            if (authError) throw authError;

            res.json({ message: 'Usuario eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar usuario' });
        }
    }
};
