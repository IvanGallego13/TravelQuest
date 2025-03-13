import express from 'express';
import { addMission, getMissions } from '../controllers/missionController.js';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.js';

const router = express.Router();

router.post(
    '/',
    [
        body('title').isString().notEmpty(),
        body('description').isString().notEmpty(),
        body('difficulty').isIn(['Fácil', 'Medio', 'Difícil']),
        body('city').isString().notEmpty()
    ],
    validate,
    addMission
);

router.get(
    '/:city',
    param('city').isString().notEmpty(),
    validate,
    getMissions
);

export default router;