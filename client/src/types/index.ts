export interface User {
    _id: string;
    username: string;
    email: string;
}

export interface Transaction {
    _id: string;
    user: string;
    title: string;
    amount: number;
    category: string;
    type: "income" | "expense";
    date: string;
    description?: string;
}

export interface CategoryBudget {
    _id?: string;
    category: string;
    limit: number;
    spent: number; // Dodaj to pole
    color?: string; // Dodaj to pole
}

export interface BudgetGoal {
    id: string;
    _id?: string; // Dodaj pole z MongoDB
    name: string;
    targetAmount: number;
    savedAmount: number;
    deadline?: Date;
}

export interface BudgetAlert {
    category: string;
    percentUsed: number;
    message: string;
    severity: 'error' | 'warning';
    color?: string;
}