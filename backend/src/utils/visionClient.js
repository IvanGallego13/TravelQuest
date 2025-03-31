import vision from '@google-cloud/vision';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al archivo JSON de la clave
const keyPath = path.join(__dirname, '../../config/google-vision-key.json');

const client = new vision.ImageAnnotatorClient({
    keyFilename: keyPath,
});

export default client; 