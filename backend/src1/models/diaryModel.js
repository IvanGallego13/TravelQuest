export const createDiaryEntry = async (userId, city, content, imageUrl) => {
    const query = `INSERT INTO diary (user_id, city, content, image_url) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [userId, city, content, imageUrl];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const getDiaryEntriesByUser = async (userId) => {
    const query = `SELECT * FROM diary WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(query, [userId]);
    return result.rows;
};