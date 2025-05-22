import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transaction';
import categoryBudgetRoutes from './routes/categoryBudget';
import savingGoalRoutes from './routes/savingGoal';

// Załadowanie zmiennych środowiskowych
dotenv.config();

// Połączenie z bazą danych
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Definicja routerów
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/category-budget', categoryBudgetRoutes);
app.use('/api/saving-goals', savingGoalRoutes);

// Usunięto obsługę statycznych plików frontendu

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Serwer uruchomiony na porcie ${PORT}`));