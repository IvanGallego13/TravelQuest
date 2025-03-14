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
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Conectar a PostgreSQL
async function testDBConnection() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('📌 Conexión a PostgreSQL exitosa:', res.rows[0]);
    } catch (err) {
        console.error('❌ Error conectando a PostgreSQL:', err);
    }
}
testDBConnection();

// Rutas principales
app.get('/', (req, res) => {
    res.send('¡Bienvenido a TravelQuest API!');
});

app.post('/register', async (req, res) => {
    const { nombre, correo, contraseña } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO usuario (nombre, correo, contraseña) VALUES ($1, $2, $3) RETURNING *',
            [nombre, correo, contraseña]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar usuario');
    }
});

// Rutas específicas
app.use('/users', userRoutes);
app.use('/missions', missionRoutes);
app.use('/diary', diaryRoutes);
app.use('/auth', authRoutes);
app.use('/ranking', rankingRoutes);

app.listen(3000, () => {
    console.log('Servidor ejecutándose en el puerto 3000');
});