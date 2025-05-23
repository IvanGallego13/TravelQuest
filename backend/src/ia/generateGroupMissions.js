import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Genera múltiples misiones agrupadas usando IA.
 * @param {string} city - Nombre de la ciudad.
 * @param {number} quantity - Número de misiones a generar.
 * @returns {Promise<Array>} - Lista de misiones.
 */
export const generateGroupMissions = async (city, quantity) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Eres un guía turístico experto. Crea ${quantity} misiones turísticas únicas para un grupo de amigos que va a explorar juntos una sola zona de la ciudad de ${city}.

Primero, elige una **zona turística concreta** de esa ciudad (ejemplo: el Barrio Gótico, la Sagrada Familia, el Parque Güell...).

Luego, genera las misiones dentro de esa zona, asegurándote de que **todas estén ubicadas cerca unas de otras** (menos de 500 metros entre sí), para que el grupo no se disperse.

Devuelve las misiones en formato JSON como un array, así:

[
  {
    "title": "Título breve",
    "description": "Descripción clara y creativa de la misión",
    "difficulty": 1 a 5,
    "keywords": ["visual", "clave", "de", "la", "misión"],
    "nombre_objeto": "Qué se debe fotografiar",
    "historia": "Historia o contexto cultural (250-400 palabras, sin hablar del usuario)"
  }
]

IMPORTANTE:
- Devuelve SOLO el array JSON, sin \`\`\`, sin comentarios y sin explicaciones fuera del JSON.
- Usa lenguaje turístico, creativo y claro.
- La historia debe parecer una cápsula de museo: cálida, informativa, sin tono de reto ni instrucciones.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text().trim();

    console.log("🧠 Respuesta cruda de la IA:\n", raw);

    const cleaned = raw.replace(/```(json)?/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);

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
        console.error("❌ Misión incompleta:", m);
        throw new Error("Una de las misiones está incompleta");
      }
    }

    return json;
  } catch (error) {
    console.error("❌ Error al generar misiones de grupo:", error.message);
    throw new Error("La IA no pudo generar misiones grupales válidas");
  }
};
