// backend/src/routes/index.js
import chatRoutes from './chat';
import amigosRoutes from './AmigosRoutes';
import diarioRoutes from './DiarioRoutes';
import imageRoutes from './imageRoutes';
import locationRoutes from './locationRoutes';
import mensajeRoutes from './MensajeRoutes';
import misionesRoutes from './MisionesRoutes';
import rankingRoutes from './RankingRoutes';
import usuarioRoutes from './UsuarioRoutes';
import viajeRoutes from './ViajeRoutes';

export default (app) => {
    app.use('/api/chat', chatRoutes);
    app.use('/api/amigos', amigosRoutes);
    app.use('/api/diario', diarioRoutes);
    app.use('/api/images', imageRoutes);
    app.use('/api/locations', locationRoutes);
    app.use('/api/mensajes', mensajeRoutes);
    app.use('/api/misiones', misionesRoutes);
    app.use('/api/ranking', rankingRoutes);
    app.use('/api/usuarios', usuarioRoutes);
    app.use('/api/viajes', viajeRoutes);
};