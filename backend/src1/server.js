// backend/src/server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import missionRoutes from './routes/missionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import diaryRoutes from './routes/diaryRoutes.js';
import rankingRoutes from './routes/rankingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import friendsRoutes from './routes/friendsRoutes.js';
import messagesRoutes from './routes/messagesRoutes.js';
import supabase from './config/supabaseClient.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conectar a Supabase (PostgreSQL)
async function testDBConnection() {
    const { data, error } = await supabase.from('Usuario').select('*').limit(1);
    if (error) {
        console.error('❌ Error conectando a Supabase:', error);
    } else {
        console.log('📌 Conexión a Supabase exitosa:', data);
    }
}
testDBConnection();

// Rutas principales
app.get('/', (req, res) => {
    res.send('¡Bienvenido a TravelQuest API con Supabase!');
});

// Rutas específicas
app.use('/users', userRoutes);
app.use('/missions', missionRoutes);
app.use('/diary', diaryRoutes);
app.use('/auth', authRoutes);
app.use('/ranking', rankingRoutes);
app.use('/friends', friendsRoutes);
app.use('/messages', messagesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
