import client from './visionClient.js';

export async function validateImageByLabels(imageUrl, expectedKeywords) {
    try {
        const [result] = await client.labelDetection(imageUrl);
        const labels = result.labelAnnotations || [];

        console.log('Etiquetas detectadas:', labels.map(l => l.description));

        // Validación con score mínimo de 0.7
        const matched = labels.some(label => 
            label.score >= 0.7 && 
            expectedKeywords.some(keyword => 
                label.description?.toLowerCase().includes(keyword.toLowerCase())
            )
        );

        return matched;
    } catch (error) {
        console.error('Error al validar imagen:', error);
        throw error;
    }
}

export async function getImageLabels(imageUrl) {
    try {
        const [result] = await client.labelDetection(imageUrl);
        const labels = result.labelAnnotations || [];
        
        return labels.map(label => ({
            description: label.description,
            score: label.score
        }));
    } catch (error) {
        console.error('Error al obtener etiquetas:', error);
        throw error;
    }
}
