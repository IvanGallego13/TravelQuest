import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar el cliente de Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Definir los niveles de dificultad y sus características
const DIFFICULTY_LEVELS = {
    "facil": {
        description: "Monumentos o lugares turísticos accesibles y populares.",
        points: 10,
        timeLimit: 60 // minutos
    },
    "media": {
        description: "Exploración de estatuas, obras de arte o edificios históricos menos conocidos.",
        points: 20,
        timeLimit: 90
    },
    "dificil": {
        description: "Descubrimiento de detalles ocultos o curiosidades poco evidentes en la ciudad.",
        points: 30192.168,
        timeLimit: 120
    }
};


const createMissionPrompt = (city, difficultyKey, objetosPrevios = []) => {
    const nivel = DIFFICULTY_LEVELS[difficultyKey];

    const listaObjetos = objetosPrevios.length
    ? `Evita utilizar estos objetos ya usados por el usuario: ${objetosPrevios.map(obj => `"${obj}"`).join(", ")}.`
    : "";

    return `
    Eres un experto en historia arte y patrimonio cultural. Genera una misión única para explorar la ciudad de ${city}. 

    Nivel de dificultad: ${difficultyKey.toUpperCase()} - ${nivel.description}
    ${listaObjetos}

    Devuelve la misión en formato JSON con estas claves:

    {
    "title": "Máximo 8 palabras",
    "description": "Descripción clara de máximo 8 líneas",
    "keywords": ["palabra1", "palabra2", ...], // Entre 3 y 6 palabras clave visuales,
    "nombre_objeto": "Nombre del objeto específico que debe fotografiarse (ej: estatua de Cervantes, escudo del Ayuntamiento, rosetón de la Catedral)"
    "historia": "Texto explicativo y cultural sobre el objeto fotografiado, sin lenguaje de misión"
    }

    IMPORTANTE:
    - Devuelve SOLO el JSON, sin explicación adicional.
    - En el campo 'descripion' describe que buscar para fotografiar, una pista creativa para facilitar la misión, una zona geografica dentro de la ciudad, al final pon algo muy corto, alentador, dinamico y divertido
    - El campo 'nombre_objeto' debe ser una frase corta y clara, que identifique con precisión qué hay que fotografiar.
    - 'keywords' debe contener palabras claves relacionadas con ese objeto visual.
    - Asegúrate de que la misión no sea genérica, sino específica y visualmente verificable.
    - La misión debe poder completarse con una sola fotografía clara y representativa.
    - Con respeto al campo historia:
        - Este campo NO debe tener instrucciones ni tono de reto, ten en cuenta que esto lo verá el usuario solo cuando ya haya completado la mision y fotografiado el elemento.
        - No uses frases como "la misión te lleva a…" o "debes encontrar…".
        - No hables del usuario ni des consejos.
        - En vez de eso, escribe un texto como si fuera una cápsula de historia o cultura para un museo o guía turística.
        - Divide el texto en parrafos para una lectura más fácil.

        Contenido sugerido:
        - Contexto histórico, simbólico o artístico del objeto.
        - Estilo arquitectónico o cultural si aplica.
        - Curiosidades o datos poco conocidos del lugar.
        - Importancia local del objeto o del entorno donde está ubicado.
        - Debe contener entre 250 y 400 palabras.

        Tono de la historia:
        - Informativo, cálido y accesible.
        - Evita dramatismo o lenguaje motivacional.
        - Imagina que lo lee un viajero curioso que ya fotografió ese objeto y quiere saber más.

    - Duración aproximada: ${nivel.timeLimit} minutos.
    `;
    };


export const generateMission = async (city, difficultyRaw, objetosPrevios = []) => {
   const difficulty = difficultyRaw.toLowerCase();
    
    if (!DIFFICULTY_LEVELS[difficulty]) {
        throw new Error(`Nivel de dificultad no válido. Debe ser uno de: ${Object.keys(DIFFICULTY_LEVELS).join(', ')}`);
    }

    try {
        // Obtener el modelo 
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Crear el prompt
        const prompt = createMissionPrompt(city, difficulty,objetosPrevios);

        // Generar la respuesta
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const raw = response.text().trim();

        console.log("🧠 Respuesta cruda de la IA:\n", raw);

        // Limpiar delimitadores de markdown tipo ```json o ```
        const cleaned = raw.replace(/```(json)?/g, "").trim();

        console.log("🧹 JSON limpio:\n", cleaned);

        const match = cleaned.match(/\{[\s\S]*\}/); // encuentra el primer bloque {...}
        if (!match){
            console.error("⚠️ No se encontró bloque JSON en:\n", cleaned);
            throw new Error("No se encontró bloque JSON en el texto de la IA");
        }    

        // Intentar parsear el JSON
        let json;
        try {
            json = JSON.parse(match[0]);
            if (!json.title || !json.description || !json.nombre_objeto || !Array.isArray(json.keywords) || !json.historia) {
                throw new Error("La IA devolvió datos incompletos");
            }
        } catch (e) {
        console.error("❌ Error al parsear la respuesta de la IA:", response.text());
        console.error("🔍 Contenido fallido:\n", match[0]);
        throw new Error("La IA no devolvió un JSON válido.");
        }

        // Devolver misión formateada
        return {
        titulo: json.title,
        descripcion: json.description,
        keywords: json.keywords,
        nombre_objeto: json.nombre_objeto,
        puntos: DIFFICULTY_LEVELS[difficulty].points,
        tiempoLimite: DIFFICULTY_LEVELS[difficulty].timeLimit,
        dificultad: difficulty,
        historia: json.historia,
        };

        /*const displayNames = {
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
        };*/

    } catch (error) {
        throw new Error(`Error al generar la misión: ${error.message}`);
    }
}; 

  