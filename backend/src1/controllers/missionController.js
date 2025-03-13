import { createMission, getMissionsByCity } from '../models/missionModel.js';

export const addMission = async (req, res) => {
    try {
        const { title, description, difficulty, city } = req.body;
        const mission = await createMission(title, description, difficulty, city);
        res.status(201).json(mission);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear misión' });
    }
};

export const getMissions = async (req, res) => {
    try {
        const { city } = req.params;
        const missions = await getMissionsByCity(city);
        res.json(missions);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener misiones' });
    }
};