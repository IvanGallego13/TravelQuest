// Requiere dotenv para cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// Verifica si la clave de API está correctamente cargada
if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY no está definida en las variables de entorno.");
    process.exit(1); // Sale del proceso si no se encuentra la clave de API
}

// Requiere la librería de OpenAI
const OpenAI = require("openai");

// Crea una instancia de OpenAI usando la clave de API desde las variables de entorno
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Clave de API cargada desde el archivo .env
});

async function getChatResponse(message) {
    try {
        // Realiza una solicitud a la API de OpenAI para obtener una respuesta del modelo GPT
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // El modelo de OpenAI a utilizar
            messages: [{ role: "user", content: message }], // Mensaje del usuario
        });

        // Retorna la respuesta generada por el modelo
        return response.choices[0].message.content;
    } catch (error) {
        // Captura y muestra el error si ocurre durante la solicitud
        console.error("Error en OpenAI:", error);
        return "Hubo un problema con el chatbot."; // Mensaje de error general
    }
}

// Exporta la función para que pueda ser utilizada en otros archivos
module.exports = getChatResponse;
