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
    "difficulty": 1 a 5
  },
  ...
]

IMPORTANTE:
- Usa lenguaje turístico, creativo y claro.
- No repitas estructuras.
- No pongas explicación fuera del JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text().trim();

    if (raw.startsWith("<")) {
      console.error("❌ La respuesta de la IA parece ser HTML (fallo del modelo)");
      throw new Error("La IA no respondió correctamente. Intenta de nuevo.");
    }


    console.log("🧠 Respuesta IA (cruda):\n", raw);

    const cleaned = raw.replace(/```(json)?/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*?\]/);

    if (!match) {
      console.error("❌ No se encontró array JSON en:\n", cleaned);
      throw new Error("La IA no devolvió misiones válidas.");
    }

    let json;
    try {
      json = JSON.parse(match[0]);
    } catch (e) {
      console.error("❌ Error al hacer parse del JSON:\n", match[0]);
      throw new Error("La IA devolvió un JSON inválido.");
    }


    // Validación básica
    if (!Array.isArray(json)) throw new Error("La IA no devolvió una lista de misiones");
    for (const m of json) {
      if (!m.title || !m.description || typeof m.difficulty !== "number") {
        throw new Error("Una de las misiones generadas está incompleta");
      }
    }

    return json;
  } catch (error) {
    console.error("❌ Error al generar misiones de grupo:", error.message);
    throw new Error("La IA no pudo generar misiones grupales válidas");
  }
};
