import express from 'express';
import { registerUser, getUser } from '../controllers/userController.js';
import { body, param } from 'express-validator';
import validate from '../middlewares/validate.js';

const router = express.Router();

router.post(
    '/register',
    [
        body('id').isString().notEmpty(),
        body('email').isEmail(),
        body('name').isString().notEmpty()
    ],
    validate,
    registerUser
);

router.get(
    '/:id',
    param('id').isString().notEmpty(),
    validate,
    getUser
);

export default router;