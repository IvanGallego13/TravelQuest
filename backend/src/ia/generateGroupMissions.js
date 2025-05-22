import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar el cliente de Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Crea el prompt para generar múltiples misiones grupales en una misma zona.
 */
const createGroupMissionsPrompt = (city: string, quantity: number) => {
  return `
Eres un experto en historia, arte y patrimonio cultural. Genera ${quantity} misiones únicas agrupadas para explorar una sola zona de la ciudad de ${city}.

Cada misión estará ubicada a menos de 500 metros de las demás. Elige una **zona concreta** (ej: Barrio Gótico, parque emblemático, casco antiguo...) y mantén la coherencia espacial entre todas.

Devuelve las misiones en un array JSON, sin explicación adicional, con el siguiente formato:

[
  {
    "title": "Máximo 8 palabras",
    "description": "Descripción clara de máximo 8 líneas",
    "difficulty": 1 a 5,
    "keywords": ["palabra1", "palabra2", ...], // 3 a 6 palabras clave visuales
    "nombre_objeto": "Nombre del objeto específico que debe fotografiarse (ej: estatua de Cervantes, escudo del Ayuntamiento, rosetón de la Catedral)",
    "historia": "Texto explicativo y cultural sobre el objeto fotografiado, sin lenguaje de misión"
  },
  ...
]

IMPORTANTE:
- Devuelve SOLO el array JSON, sin \`\`\`json ni explicaciones externas.
- 'description' debe ser sugerente, con pistas visuales y cierre dinámico (como "¡Captúralo!" o "¡A por ello!").
- 'nombre_objeto' debe ser una frase clara, concreta y verificable visualmente.
- Cada misión debe poder completarse con una sola fotografía clara.
- El campo 'historia':
  - NO debe tener tono de reto, instrucciones ni dirigirse al usuario.
  - Es una cápsula cultural pensada para leerse tras completar la misión.
  - Escribe en tono cálido, accesible, dividido en párrafos, entre 250 y 400 palabras.
  - Incluye contexto histórico, artístico, simbólico o anecdótico del objeto.
  - Evita dramatismo, lenguaje heroico o frases como “tu misión será…”.

Tu respuesta debe permitir que el contenido sea directamente parseable como JSON.
`;
};

/**
 * Genera múltiples misiones agrupadas usando IA.
 * @param city - Nombre de la ciudad.
 * @param quantity - Número de misiones a generar.
 * @returns Lista de misiones enriquecidas.
 */
export const generateGroupMissions = async (city: string, quantity: number) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = createGroupMissionsPrompt(city, quantity);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text().trim();

    console.log("🧠 Respuesta cruda de la IA:\n", raw);

    const cleaned = raw.replace(/```(json)?/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*?\]/);

    if (!match) {
      console.error("⚠️ No se encontró array JSON válido:\n", cleaned);
      throw new Error("La IA no devolvió un array JSON válido.");
    }

    let json;
    try {
      json = JSON.parse(match[0]);
      if (!Array.isArray(json)) throw new Error("No es un array");
    } catch (e) {
      console.error("❌ Error al parsear el JSON:\n", match[0]);
      throw new Error("La IA devolvió un JSON mal formado.");
    }

    // Validación de cada misión
    for (const m of json) {
      if (
        !m.title ||
        !m.description ||
        typeof m.difficulty !== "number" ||
        !Array.isArray(m.keywords) ||
        !m.nombre_objeto ||
        !m.historia
      ) {
        throw new Error("Una de las misiones está incompleta");
      }
    }

    return json;
  } catch (error) {
    console.error("❌ Error al generar misiones de grupo:", error.message);
    throw new Error("La IA no pudo generar misiones grupales válidas");
  }
};
