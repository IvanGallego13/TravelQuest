// backend/src/routes/locationRoutes.js
import express from "express";
import { body } from "express-validator";
import validate from "../middlewares/validate.js";
import { getCityFromCoordinates, getCityFromName } from "../controllers/locationController.js";

const router = express.Router();

// Ruta para obtener la ciudad desde coordenadas GPS
router.post(
    "/geolocation",
    [
        body("latitude").isFloat().withMessage("La latitud es obligatoria."),
        body("longitude").isFloat().withMessage("La longitud es obligatoria."),
    ],
    getCityFromCoordinates
);

// Ruta para obtener información de una ciudad ingresada por nombre
router.post(
    "/city",
    [
        body("city").isString().notEmpty().withMessage("El nombre de la ciudad es obligatorio."),
    ],
    getCityFromName
);

export default router;
