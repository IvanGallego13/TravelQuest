import { pool } from '../config/db.js';

export const createUser = async (id, email, name) => {
    const query = `INSERT INTO users (id, email, name) VALUES ($1, $2, $3) RETURNING *`;
    const values = [id, email, name];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const getUserById = async (id) => {
    const query = `SELECT * FROM users WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};
