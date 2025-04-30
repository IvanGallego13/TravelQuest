import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import { createClient } from '@supabase/supabase-js';

// Rutas
import usuarioRoutes from './routes/usuarioRoutes.js';
import diarioRoutes from './routes/DiarioRoutes.js';
import amigosRoutes from './routes/amigosRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import mensajeRoutes from './routes/mensajeRoutes.js';
import misionesRoutes from './routes/misionRoutes.js';
import rankingRoutes from './routes/rankingRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import viajeRoutes from './routes/viajeRoutes.js';
import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js';
import ajustesRoutes from './routes/ajustesRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './uploads'
}));
app.use((req, res, next) => {
  console.log("📥 Petición recibida:", req.method, req.url);
  next();
});



// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/diarios', diarioRoutes);
app.use('/api/amigos', amigosRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/misiones', misionesRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/imagenes', imageRoutes);
app.use('/api/viajes', viajeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ajustes', ajustesRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('🎒 API de Tu App de Viajes funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌍 Servidor escuchando en http://localhost:${PORT}`);
});
