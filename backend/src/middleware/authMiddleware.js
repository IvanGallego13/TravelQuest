import { getUserFromToken } from './auth.js';

export const authMiddleware = async (req, res, next) => {
    // Modifica esta línea para depurar el token recibido
    const token = req.header('Authorization');
    console.log('🔑 Token recibido en middleware:', token ? 'Sí' : 'No');
    if (token) {
        console.log('🔑 Token format:', token.substring(0, 15) + '...');
    }

    // El token debería tener el formato "Bearer xxxxx..."
    const actualToken = token?.split(' ')[1];

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
