import { Response } from "express";
import { validationResult } from "express-validator";
import Transaction from "../models/Transaction";
import { AuthRequest } from "../types";

// Get all transactions for the logged-in user
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ msg: "Użytkownik nie uwierzytelniony" });
            return;
        }

        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        console.error(err instanceof Error ? err.message : 'Nieznany błąd');
        res.status(500).send("Błąd serwera");
    }
};

// Add a new transaction
export const addTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { amount, type, category, date, description } = req.body;

    try {
        if (!req.user) {
            res.status(401).json({ msg: "Użytkownik nie uwierzytelniony" });
            return;
        }

        const transaction = new Transaction({
            user: req.user.id,
            amount,
            type,
            category,
            date: date || Date.now(),
            description,
        });

        await transaction.save();
        res.status(201).json(transaction);
    } catch (err) {
        console.error(err instanceof Error ? err.message : 'Nieznany błąd');
        res.status(500).send("Błąd serwera");
    }
};

// Delete transaction by ID
export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ msg: "Użytkownik nie uwierzytelniony" });
            return;
        }

        const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
        if (!transaction) {
            res.status(404).json({ msg: "Transakcja nie znaleziona" });
            return;
        }
        await transaction.deleteOne();
        res.json({ msg: "Transakcja usunięta" });
    } catch (err) {
        console.error(err instanceof Error ? err.message : 'Nieznany błąd');
        res.status(500).send("Błąd serwera");
    }
};

// Update transaction by ID
export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { amount, type, category, date, description } = req.body;

    try {
        if (!req.user) {
            res.status(401).json({ msg: "Użytkownik nie uwierzytelniony" });
            return;
        }

        let transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
        if (!transaction) {
            res.status(404).json({ msg: "Transakcja nie znaleziona" });
            return;
        }

        transaction.amount = amount !== undefined ? amount : transaction.amount;
        transaction.type = type || transaction.type;
        transaction.category = category || transaction.category;
        transaction.date = date || transaction.date;
        transaction.description = description !== undefined ? description : transaction.description;

        await transaction.save();
        res.json(transaction);
    } catch (err) {
        console.error(err instanceof Error ? err.message : 'Nieznany błąd');
        res.status(500).send("Błąd serwera");
    }
};