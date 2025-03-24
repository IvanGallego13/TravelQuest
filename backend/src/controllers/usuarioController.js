import { registerUser, loginUser, getUserFromToken } from '../middleware/auth.js';

export const usuarioController = {
    // Registro de usuario
    registerUser: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await registerUser(email, password);
            res.status(201).json({ message: 'Usuario registrado exitosamente', user });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Login de usuario
    loginUser: async (req, res) => {
        try {
            const { email, password } = req.body;
            const data = await loginUser(email, password);
            res.json({ message: 'Login exitoso', data });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    },

    // Obtener perfil del usuario autenticado
    getUserProfile: async (req, res) => {
        try {
            const user = await getUserFromToken(req.user.id);
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el perfil' });
        }
    },

    // Obtener todos los usuarios (solo admin)
    getAllUsers: async (req, res) => {
        try {
            // Aquí implementarías la lógica para obtener todos los usuarios
            // Por ahora solo retornamos un mensaje
            res.json({ message: 'Lista de usuarios (implementar)' });
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    },

    // Obtener usuario por ID
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await getUserFromToken(id);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener usuario' });
        }
    },

    // Actualizar usuario
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;
            // Aquí implementarías la lógica para actualizar el usuario
            res.json({ message: 'Usuario actualizado (implementar)' });
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar usuario' });
        }
    },

    // Eliminar usuario
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            // Aquí implementarías la lógica para eliminar el usuario
            res.json({ message: 'Usuario eliminado (implementar)' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar usuario' });
        }
    }
}; 