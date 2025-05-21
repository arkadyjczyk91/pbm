import express from 'express';
import { body } from 'express-validator';
import * as transactionController from '../controllers/transactionController';
import auth from '../middleware/auth';

const router = express.Router();

// Wszystkie trasy są chronione przez middleware auth
router.use(auth);

// Pobieranie wszystkich transakcji
router.get('/', transactionController.getTransactions);

// Dodawanie nowej transakcji
router.post(
    '/',
    [
        body('amount').isNumeric().withMessage('Kwota musi być liczbą').not().equals('0').withMessage('Kwota nie może wynosić 0'),
        body('type').isIn(['income', 'expense']).withMessage('Typ musi być "income" lub "expense"'),
        body('category').isString().withMessage('Kategoria jest wymagana')
    ],
    transactionController.addTransaction
);

// Aktualizacja transakcji
router.put(
    '/:id',
    [
        body('amount').optional().isNumeric().withMessage('Kwota musi być liczbą').not().equals('0').withMessage('Kwota nie może wynosić 0'),
        body('type').optional().isIn(['income', 'expense']).withMessage('Typ musi być "income" lub "expense"'),
        body('category').optional().isString().withMessage('Kategoria musi być tekstem')
    ],
    transactionController.updateTransaction
);

// Usuwanie transakcji
router.delete('/:id', transactionController.deleteTransaction);

export default router;