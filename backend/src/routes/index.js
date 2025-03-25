// backend/src/routes/index.js
import chatRoutes from './chat';
import amigosRoutes from './amigosRoutes';
import diarioRoutes from './diarioRoutes';
import imageRoutes from './imageRoutes';
import locationRoutes from './locationRoutes';
import mensajeRoutes from './mensajeRoutes';
import misionRoutes from './misionRoutes';
import rankingRoutes from './rankingRoutes';
import usuarioRoutes from './usuarioRoutes';
import viajeRoutes from './viajeRoutes';

export default (app) => {
    app.use('/api/chat', chatRoutes);
    app.use('/api/amigos', amigosRoutes);
    app.use('/api/diario', diarioRoutes);
    app.use('/api/images', imageRoutes);
    app.use('/api/locations', locationRoutes);
    app.use('/api/mensajes', mensajeRoutes);
    app.use('/api/misiones', misionRoutes);
    app.use('/api/ranking', rankingRoutes);
    app.use('/api/usuarios', usuarioRoutes);
    app.use('/api/viajes', viajeRoutes);
};