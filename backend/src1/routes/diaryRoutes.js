import express from 'express';
import { addDiaryEntry, getUserDiary } from '../controllers/diaryController.js';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.js';

const router = express.Router();

router.post(
    '/',
    [
        body('userId').isString().notEmpty(),
        body('city').isString().notEmpty(),
        body('content').isString().notEmpty(),
        body('imageUrl').optional().isURL()
    ],
    validate,
    addDiaryEntry
);

router.get(
    '/:userId',
    param('userId').isString().notEmpty(),
    validate,
    getUserDiary
);

export default router;