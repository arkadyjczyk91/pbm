import { Response } from "express";
import { validationResult } from "express-validator";
import SavingGoal from "../models/SavingGoal";
import { AuthRequest } from "../types";

// Pobierz wszystkie cele użytkownika
export const getSavingGoals = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ msg: "Użytkownik nie uwierzytelniony" });
            return;
        }
        const goals = await SavingGoal.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (err) {
        res.status(500).send("Błąd serwera");
    }
};

// Dodaj nowy cel
export const addSavingGoal = async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { name, targetAmount, savedAmount, deadline } = req.body;
    try {
        if (!req.user) {
            res.status(401).json({ msg: "Użytkownik nie uwierzytelniony" });
            return;
        }
        const goal = new SavingGoal({
            user: req.user.id,
            name,
            targetAmount,
            savedAmount,
            deadline
        });
        await goal.save();
        res.status(201).json(goal);
    } catch (err) {
        res.status(500).send("Błąd serwera");
    }
};

// Usuń cel
export const deleteSavingGoal = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ msg: "Użytkownik nie uwierzytelniony" });
            return;
        }
        const goal = await SavingGoal.findOne({ _id: req.params.id, user: req.user.id });
        if (!goal) {
            res.status(404).json({ msg: "Cel nie znaleziony" });
            return;
        }
        await goal.deleteOne();
        res.json({ msg: "Cel usunięty" });
    } catch (err) {
        res.status(500).send("Błąd serwera");
    }
};

// Aktualizuj cel
export const updateSavingGoal = async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { name, targetAmount, savedAmount, deadline } = req.body;
    try {
        if (!req.user) {
            res.status(401).json({ msg: "Użytkownik nie uwierzytelniony" });
            return;
        }
        let goal = await SavingGoal.findOne({ _id: req.params.id, user: req.user.id });
        if (!goal) {
            res.status(404).json({ msg: "Cel nie znaleziony" });
            return;
        }

        goal.name = name ?? goal.name;
        goal.targetAmount = targetAmount ?? goal.targetAmount;
        goal.savedAmount = savedAmount ?? goal.savedAmount;
        goal.deadline = deadline ?? goal.deadline;

        await goal.save();
        res.json(goal);
    } catch (err) {
        res.status(500).send("Błąd serwera");
    }
};