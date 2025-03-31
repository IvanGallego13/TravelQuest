import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar el cliente de Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Definir los niveles de dificultad y sus características
const DIFFICULTY_LEVELS = {
    "facil": {
        description: "Lugares turísticos principales y fácilmente accesibles",
        points: 100,
        timeLimit: 60 // minutos
    },
    "medio": {
        description: "Lugares históricos menos conocidos y estatuas",
        points: 200,
        timeLimit: 90
    },
    "dificil": {
        description: "Detalles ocultos y curiosidades poco evidentes",
        points: 300,
        timeLimit: 120
    }
};

/**
 * Crea un prompt detallado para generar la misión basado en la ciudad y dificultad.
 * @param {string} city - Nombre de la ciudad
 * @param {string} difficulty - Nivel de dificultad
 * @returns {string} Prompt generado
 */
const createMissionPrompt = (city, difficulty) => {
    return `
    Actúa como un experto en historia y cultura de ${city}. Genera una misión de exploración urbana que cumpla con los siguientes criterios:

    1. Nivel de dificultad: ${difficulty} (${DIFFICULTY_LEVELS[difficulty].description})
    2. La misión debe incluir una descripción detallada que contenga:
       * Qué debe hacer el usuario específicamente
       * Contexto histórico del lugar
       * Instrucciones específicas sobre qué buscar o fotografiar
       * Una pista para ayudar a completar la misión
       * Ubicación específica donde realizar la misión

    3. La misión debe ser:
       * Educativa y culturalmente relevante
       * Segura y accesible
       * Realizable en ${DIFFICULTY_LEVELS[difficulty].timeLimit} minutos
       * Verificable mediante una fotografía

    IMPORTANTE: Responde SOLO con la descripción detallada, sin incluir ningún otro campo o formato JSON. La descripción debe ser un texto continuo que integre naturalmente todos los elementos requeridos.
    `;
};

/**
 * Genera una misión personalizada usando la API de Google Gemini.
 * @param {string} city - Nombre de la ciudad
 * @param {string} difficulty - Nivel de dificultad
 * @returns {Promise<Object>} Datos de la misión generada
 */
export const generateMission = async (city, difficulty) => {
    difficulty = difficulty.toLowerCase();
    
    if (!DIFFICULTY_LEVELS[difficulty]) {
        throw new Error(`Nivel de dificultad no válido. Debe ser uno de: ${Object.keys(DIFFICULTY_LEVELS).join(', ')}`);
    }

    try {
        // Obtener el modelo (usando Gemini 1.5 Flash-8B que tiene una capa gratuita más generosa)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

        // Crear el prompt
        const prompt = createMissionPrompt(city, difficulty);

        // Generar la respuesta
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const descripcion = response.text();
        
        // Devolver la misión generada
        return {
            descripcion,
            puntos: DIFFICULTY_LEVELS[difficulty].points,
            tiempoLimite: DIFFICULTY_LEVELS[difficulty].timeLimit,
            dificultad: difficulty
        };

    } catch (error) {
        throw new Error(`Error al generar la misión: ${error.message}`);
    }
}; 