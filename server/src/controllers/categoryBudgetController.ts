import { Response } from "express";
import CategoryBudget from "../models/CategoryBudget";
import { AuthRequest } from "../types";

// Pobierz wszystkie budżety kategorii użytkownika
export const getCategoryBudgets = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ msg: "Brak autoryzacji" });
        return;
    }
    const budgets = await CategoryBudget.find({ user: req.user.id });
    res.json(budgets);
};

// Dodaj lub zaktualizuj budżet kategorii
export const upsertCategoryBudget = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        res.status(401).json({ msg: "Brak autoryzacji" });
        return;
    }
    const { category, limit, color } = req.body;
    if (!category || typeof limit !== "number") {
        res.status(400).json({ msg: "Nieprawidłowe dane" });
        return;
    }
    const budget = await CategoryBudget.findOneAndUpdate(
        { user: req.user.id, category },
        { $set: { limit, color } },
        { upsert: true, new: true }
    );
    res.json(budget);
};

export const resetCategoryBudget = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ msg: "Brak autoryzacji" });
        return;
    }

    const budget = await CategoryBudget.findOneAndUpdate(
        { user: req.user.id, category: req.params.category },
        { $set: { limit: 0 } }, // Reset limitu do 0
        { new: true }
    );

    if (!budget) {
        res.status(404).json({ msg: "Budżet kategorii nie znaleziony" });
        return;
    }

    res.json(budget);
};