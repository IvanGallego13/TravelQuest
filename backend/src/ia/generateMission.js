import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar el cliente de Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Definir los niveles de dificultad y sus características
const DIFFICULTY_LEVELS = {
    "facil": {
        description: "Monumentos o lugares turísticos accesibles y populares.",
        points: 100,
        timeLimit: 60 // minutos
    },
    "media": {
        description: "Exploración de estatuas, obras de arte o edificios históricos menos conocidos.",
        points: 200,
        timeLimit: 90
    },
    "dificil": {
        description: "Descubrimiento de detalles ocultos o curiosidades poco evidentes en la ciudad.",
        points: 300,
        timeLimit: 120
    }
};


const createMissionPrompt = (city, difficultyKey) => {
    const nivel = DIFFICULTY_LEVELS[difficultyKey];
    return `
    Eres un experto en historia local y turismo cultural. Genera una misión única para explorar la ciudad de ${city}. 

  Nivel de dificultad: ${difficultyKey.toUpperCase()} - ${nivel.description}

  Instrucciones:
- Incluye una **descripción detallada pero directa y de 8 líneas máximo** de la misión.
- Describe **qué buscar o fotografiar**.
- Proporciona una **pista creativa** para facilitar la misión.
- Indica una **zona o punto geográfico específico** dentro de la ciudad.

  Importante:
- Responde solo con un **bloque de texto continuo**, sin formato JSON.
- La misión debe poder completarse con una sola fotografía clara y representativa.
- Debe poder realizarse en aprox. ${nivel.timeLimit} minutos.
- Sé claro, cultural y divertido.

Ejemplo de formato esperado:
"Explora el casco histórico de Toledo y busca el escudo tallado en piedra escondido en la fachada lateral del Ayuntamiento..."

¡Adelante!`;
};


export const generateMission = async (city, difficultyRaw) => {
   const difficulty = difficultyRaw.toLowerCase();
    
    if (!DIFFICULTY_LEVELS[difficulty]) {
        throw new Error(`Nivel de dificultad no válido. Debe ser uno de: ${Object.keys(DIFFICULTY_LEVELS).join(', ')}`);
    }

    try {
        // Obtener el modelo 
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Crear el prompt
        const prompt = createMissionPrompt(city, difficulty);

        // Generar la respuesta
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const description = response.text();

        const displayNames = {
            facil: "Fácil",
            media: "Media",
            dificil: "Difícil",
          };
        
        // Devolver la misión generada
        return {
            titulo: `Misión ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} en ${city}`,
            descripcion: description.trim(),
            puntos: DIFFICULTY_LEVELS[difficulty].points,
            tiempoLimite: DIFFICULTY_LEVELS[difficulty].timeLimit,
            dificultad: difficulty,
        };

    } catch (error) {
        throw new Error(`Error al generar la misión: ${error.message}`);
    }
}; 