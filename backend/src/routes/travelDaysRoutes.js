import express from 'express';
import { getCiudadActual, getUsuariosEnCiudad, getUsuariosEnMismaCiudad } from '../controllers/opcional/travelDaysController.js';

const router = express.Router();

router.get('/ciudad/:userId', getCiudadActual);
router.get('/usuarios_en_ciudad/:ciudad', getUsuariosEnCiudad);
router.get('/usuarios_misma_ciudad/:userId', getUsuariosEnMismaCiudad);

export default router; 