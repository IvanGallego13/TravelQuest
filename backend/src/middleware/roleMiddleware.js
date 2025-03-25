export const isAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
};

export const isOwnerOrAdmin = (req, res, next) => {
    const userId = req.params.id;
    if (req.user && (req.user.id === userId || req.user.rol === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. No tienes permisos para realizar esta acción.' });
    }
}; 