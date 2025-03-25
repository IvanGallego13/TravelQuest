import axios from 'axios';

// Definir tu clave API de OpenAI (también se puede poner en .env)
const openaiApiKey = process.env.OPENAI_API_KEY;

const generateMissions = async (city) => {
    try {
        const prompt = `Genera 3 misiones turísticas para un viajero en la ciudad de ${city}. Cada misión debe tener una dificultad (fácil, media, difícil) y una descripción detallada.`;

        // Realizamos la llamada a la API de OpenAI
        const response = await axios.post(
            'https://api.openai.com/v1/completions',
            {
                model: 'text-davinci-003', // Puedes elegir otro modelo según lo que necesites
                prompt: prompt,
                max_tokens: 150, // Ajusta los tokens según la cantidad de texto que necesites
                temperature: 0.7, // Controla la creatividad de la respuesta
            },
            {
                headers: {
                    Authorization: `Bearer ${openaiApiKey}`,
                },
            }
        );

        const missions = response.data.choices[0].text.split('\n').map((mission) => {
            const [description, difficulty] = mission.split(' - ');
            return { description, difficulty };
        });

        return missions;

    } catch (error) {
        console.error('Error generating missions:', error);
        throw new Error('No se pudieron generar las misiones.');
    }
};

export default generateMissions;
