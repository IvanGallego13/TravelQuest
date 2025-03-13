export const createMission = async (title, description, difficulty, city) => {
    const query = `INSERT INTO missions (title, description, difficulty, city) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [title, description, difficulty, city];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const getMissionsByCity = async (city) => {
    const query = `SELECT * FROM missions WHERE city = $1`;
    const result = await pool.query(query, [city]);
    return result.rows;
};