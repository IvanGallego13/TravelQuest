// backend/src/server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import missionRoutes from './routes/missionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import diaryRoutes from './routes/diaryRoutes.js';
import rankingRoutes from './routes/rankingRoutes.js';
import { pool } from './config/db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a PostgreSQL
testDBConnection();
async function testDBConnection() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('📌 Conexión a PostgreSQL exitosa:', res.rows[0]);
    } catch (err) {
        console.error('❌ Error conectando a PostgreSQL:', err);
    }
}

// Rutas
import express from 'express';
import userRoutes from './routes/userRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import diaryRoutes from './routes/diaryRoutes.js';

app.use(express.json());

app.use('/users', userRoutes);
app.use('/missions', missionRoutes);
app.use('/diary', diaryRoutes);

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
