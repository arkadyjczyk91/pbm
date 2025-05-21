export interface User {
    _id: string;
    username: string;
    email: string;
}

export interface Transaction {
    _id: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
    description?: string;
    user: string;
}