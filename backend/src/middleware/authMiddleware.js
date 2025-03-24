import { getUserFromToken } from './auth.js';

export const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
    }

    try {
        // Validar token con Supabase Auth
        const user = await getUserFromToken(token.split(' ')[1]);

        if (!user) {
            return res.status(401).json({ message: 'Token inválido o expirado.' });
        }

        req.user = user; // Agregar usuario decodificado a la request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Error al validar el token.' });
    }
};
