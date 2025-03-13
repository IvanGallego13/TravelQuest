import { createUser, getUserById } from '../models/userModel.js';

export const registerUser = async (req, res) => {
    try {
        const { id, email, name } = req.body;
        const newUser = await createUser(id, email, name);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await getUserById(id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};
