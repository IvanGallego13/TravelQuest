import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import { createClient } from '@supabase/supabase-js';

// Rutas
import userRoutes from './routes/userroutes.js';
import diarioRoutes from './routes/DiarioRoutes.js';
import amigosRoutes from './routes/AmigosRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import mensajeRoutes from './routes/MensajeRoutes.js';
import misionesRoutes from './routes/misionRoutes.js';
import rankingRoutes from './routes/RankingRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import viajeRoutes from './routes/ViajeRoutes.js';
import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js';
import ajustesRoutes from './routes/ajustesRoutes.js';
import logrosRoutes from './routes/logrosRoutes.js';

dotenv.config();

const app = express();

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
app.use('/api/users', userRoutes);
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
app.use('/api/logros', logrosRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('🎒 API de Tu App de Viajes funcionando correctamente');
});

// Iniciar servidor con manejo de errores para puerto ocupado
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🌍 Servidor escuchando en http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    // Si el puerto está ocupado, intentar con puerto alternativo
    const altPort = PORT + 1;
    console.log(`⚠️ Puerto ${PORT} en uso. Intentando con puerto ${altPort}...`);
    
    app.listen(altPort, () => {
      console.log(`🌍 Servidor escuchando en http://localhost:${altPort}`);
    }).on('error', (altErr) => {
      console.error(`❌ Error al iniciar el servidor en el puerto alternativo: ${altErr.message}`);
      console.error('👉 Intenta detener otros servidores o especificar un puerto diferente con la variable PORT');
    });
  } else {
    console.error(`❌ Error al iniciar el servidor: ${err.message}`);
  }
});
