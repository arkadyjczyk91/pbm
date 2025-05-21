import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import auth from '../middleware/auth';

const router = express.Router();

// Rejestracja użytkownika
router.post(
    '/register',
    [
        body('username').isLength({ min: 3 }).withMessage('Nazwa użytkownika musi mieć co najmniej 3 znaki'),
        body('email').isEmail().withMessage('Podaj prawidłowy adres email'),
        body('password').isLength({ min: 8 }).withMessage('Hasło musi mieć co najmniej 8 znaków')
            .matches(/[0-9]/).withMessage('Hasło musi zawierać cyfrę')
            .matches(/[A-Za-z]/).withMessage('Hasło musi zawierać literę')
            .matches(/[!@#$%^&*]/).withMessage('Hasło musi zawierać znak specjalny'),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Hasła nie są takie same');
            }
            return true;
        })
    ],
    authController.register
);

// Logowanie użytkownika
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Podaj prawidłowy adres email'),
        body('password').exists().withMessage('Hasło jest wymagane')
    ],
    authController.login
);

// Pobranie danych bieżącego użytkownika
router.get('/me', auth, authController.getCurrentUser);

export default router;