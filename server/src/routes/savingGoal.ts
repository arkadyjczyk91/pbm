import express from 'express';
import { body } from 'express-validator';
import {
    getSavingGoals,
    addSavingGoal,
    deleteSavingGoal,
    updateSavingGoal
} from '../controllers/savingGoalController';
import auth from '../middleware/auth';

const router = express.Router();

router.get('/', auth, getSavingGoals);
router.post(
    '/',
    auth,
    [
        body('name').isString().notEmpty(),
        body('targetAmount').isNumeric().isFloat({ min: 1 }),
        body('savedAmount').optional().isNumeric().isFloat({ min: 0 }),
        body('deadline').optional().isISO8601()
    ],
    addSavingGoal
);
router.delete('/:id', auth, deleteSavingGoal);
router.put(
    '/:id',
    auth,
    [
        body('name').optional().isString().notEmpty(),
        body('targetAmount').optional().isNumeric().isFloat({ min: 1 }),
        body('savedAmount').optional().isNumeric().isFloat({ min: 0 }),
        body('deadline').optional().isISO8601()
    ],
    updateSavingGoal
);

export default router;