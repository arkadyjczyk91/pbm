// client/src/api/savingGoal.ts
import API from './api';
import type { BudgetGoal } from '../types';

export const fetchSavingGoals = async (): Promise<BudgetGoal[]> => {
    const res = await API.get('/api/saving-goals');
    return res.data;
};

export const addSavingGoal = async (goal: Omit<BudgetGoal, 'id'>): Promise<BudgetGoal> => {
    const res = await API.post('/api/saving-goals', goal);
    return res.data;
};

export const deleteSavingGoal = async (id: string): Promise<void> => {
    await API.delete(`/api/saving-goals/${id}`);
};

export const updateSavingGoal = async (id: string, goal: Partial<BudgetGoal>): Promise<BudgetGoal> => {
    const res = await API.put(`/api/saving-goals/${id}`, goal);
    return res.data;
};