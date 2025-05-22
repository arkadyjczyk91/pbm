// client/src/api/categoryBudget.ts
import API from './api';
import type { CategoryBudget } from '../types';

export const fetchCategoryBudgets = async (): Promise<CategoryBudget[]> => {
    const res = await API.get('/api/category-budget');
    return res.data;
};

export const upsertCategoryBudget = async (budget: Omit<CategoryBudget, 'spent'>): Promise<CategoryBudget> => {
    const res = await API.post('/api/category-budget', budget);
    return res.data;
};

export const resetCategoryBudget = async (category: string): Promise<CategoryBudget> => {
    const res = await API.put(`/api/category-budget/${encodeURIComponent(category)}/reset`);
    return res.data;
};