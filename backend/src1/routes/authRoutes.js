import express from 'express';
import { signUp, signIn } from '../controllers/authController.js';
import { body } from 'express-validator';
import validate from '../middlewares/validate.js';

const router = express.Router();

router.post(
    '/signup',
    [
        body('email').isEmail(),
        body('password').isLength({ min: 6 })
    ],
    validate,
    signUp
);

router.post(
    '/signin',
    [
        body('email').isEmail(),
        body('password').notEmpty()
    ],
    validate,
    signIn
);

export default router;
