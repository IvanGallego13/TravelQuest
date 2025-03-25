// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import fileUpload from 'express-fileupload'; // opcional si usas uploads sin multer
import { createClient } from '@supabase/supabase-js';

// Rutas
import usuarioRoutes from './routes/UsuarioRoutes.js';
import diarioRoutes from './routes/DiarioRoutes.js';
import amigosRoutes from './routes/AmigosRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import mensajeRoutes from './routes/MensajeRoutes.js';
import misionesRoutes from './routes/MisionesRoutes.js';
import rankingRoutes from './routes/RankingRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import viajeRoutes from './routes/ViajeRoutes.js';
//import authRoutes from './routes/AuthRoutes.js'; // si creaste rutas para login/signup

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/diarios', diarioRoutes);
app.use('/api/amigos', amigosRoutes);
//app.use('/api/ciudades', ciudadRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/misiones', misionesRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/imagenes', imageRoutes);
app.use('/api/viajes', viajeRoutes);
//app.use('/api/auth', authRoutes); // si tienes login/signup

// Ruta raíz
app.get('/', (req, res) => {
  res.send('🎒 API de Tu App de Viajes funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌍 Servidor escuchando en http://localhost:${PORT}`);
});
