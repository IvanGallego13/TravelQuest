import vision from '@google-cloud/vision';

// Cargar las credenciales de Google Cloud
const client = new vision.ImageAnnotatorClient();

const validateImage = async (imagePath) => {
    try {
        // Llamada a la API de Google Vision
        const [result] = await client.labelDetection(imagePath);
        const labels = result.labelAnnotations;

        // Analizar las etiquetas detectadas en la imagen
        if (labels.length === 0) {
            throw new Error('No se detectaron etiquetas en la imagen.');
        }

        // Filtrar etiquetas relevantes para la misión
        const relevantLabels = labels.map((label) => label.description.toLowerCase());
        console.log('Etiquetas detectadas:', relevantLabels);

        // Aquí puedes comparar las etiquetas de la imagen con las misiones generadas
        // Ejemplo: Si la misión es "Tomar una foto del Alcázar de Toledo" y las etiquetas detectadas incluyen "Alcázar"
        return relevantLabels.some((label) => label.includes('alcázar'));

    } catch (error) {
        console.error('Error al validar la imagen:', error);
        throw new Error('No se pudo validar la imagen.');
    }
};

export default validateImage;
