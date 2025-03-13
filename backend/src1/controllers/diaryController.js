import { createDiaryEntry, getDiaryEntriesByUser } from '../models/diaryModel.js';

export const addDiaryEntry = async (req, res) => {
    try {
        const { userId, city, content, imageUrl } = req.body;
        const entry = await createDiaryEntry(userId, city, content, imageUrl);
        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar entrada de diario' });
    }
};

export const getUserDiary = async (req, res) => {
    try {
        const { userId } = req.params;
        const entries = await getDiaryEntriesByUser(userId);
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener diario' });
    }
};