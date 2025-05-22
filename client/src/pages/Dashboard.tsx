import React, {useEffect, useState} from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Tab,
    Tabs,
    LinearProgress,
    Alert,
    Paper,
    TextField,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Divider,
    Grid
} from "@mui/material";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {format, startOfMonth, endOfMonth, subMonths, addMonths, isWithinInterval, parseISO} from 'date-fns';
import {pl as plPL} from 'date-fns/locale';
import {CATEGORIES} from "../constants.tsx";
import {fetchAllTransactions} from "../api/transaction";
import type {Transaction, BudgetGoal, CategoryBudget, BudgetAlert} from "../types";
import {fetchSavingGoals, addSavingGoal, updateSavingGoal, deleteSavingGoal} from '../api/savingGoal';
import {
    fetchCategoryBudgets,
    upsertCategoryBudget,
    resetCategoryBudget
} from '../api/categoryBudget';

const COLORS = ["#4CAF50", "#F44336", "#2196F3", "#FF9800", "#9C27B0", "#00BCD4", "#795548", "#607D8B"];

const Dashboard: React.FC = () => {
        const [transactions, setTransactions] = useState<Transaction[]>([]);
        const [loading, setLoading] = useState(true);
        const [activeTab, setActiveTab] = useState(0);
        const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
        const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
        const [comparisonPeriod, setComparisonPeriod] = useState({
            current: 'current_month',
            previous: 'previous_month'
        });
        const [showBudgetAlerts, setShowBudgetAlerts] = useState(true);
        const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);

        // Dialog do dodawania/edycji celów
        const [goalDialogOpen, setGoalDialogOpen] = useState(false);
        const [currentGoal, setCurrentGoal] = useState<BudgetGoal | null>(null);

        // Pobieranie danych transakcji
        useEffect(() => {
            const loadTransactions = async () => {
                setLoading(true);
                try {
                    const response = await fetchAllTransactions();
                    setTransactions(response.data);
                    initializeCategoryBudgets(response.data);
                } catch (error) {
                    console.error("Błąd podczas pobierania transakcji:", error);
                } finally {
                    setLoading(false);
                }
            };

            loadTransactions();
        }, []);

        // Zmodyfikuj ten useEffect, aby dane z API nadpisywały dane demo
        useEffect(() => {
            const loadGoalsAndBudgets = async () => {
                try {
                    const [goals, budgets] = await Promise.all([
                        fetchSavingGoals(),
                        fetchCategoryBudgets()
                    ]);

                    // Przekształć _id na id
                    setBudgetGoals(Array.isArray(goals) ? goals.map(goal => ({
                        ...goal,
                        id: goal._id || goal.id // Obsługa obu przypadków
                    })) : []);

                    // Jeśli mamy dane z API, zastąp nimi całkowicie dane demo
                    if (Array.isArray(budgets) && budgets.length > 0) {
                        setCategoryBudgets(budgets.map(b => ({
                            ...b,
                            spent: getCurrentMonthCategorySpending(transactions, b.category),
                            color: CATEGORIES.find(c => c.value === b.category)?.color
                        })));
                    }
                } catch (e) {
                    console.error("Błąd podczas pobierania celów i budżetów:", e);
                }
            };

            // Wywołaj funkcję tylko gdy transakcje są dostępne
            if (transactions.length > 0) {
                loadGoalsAndBudgets();
            }
        }, [transactions]);

        const initializeCategoryBudgets = async (transactions: Transaction[]) => {
            try {
                // Pobierz istniejące budżety z API
                const existingBudgets = await fetchCategoryBudgets();

                // Jeśli już mamy budżety, tylko zaktualizuj dane o wydatkach
                if (existingBudgets && existingBudgets.length > 0) {
                    const updatedBudgets = existingBudgets.map(b => ({
                        ...b,
                        spent: getCurrentMonthCategorySpending(transactions, b.category),
                        color: CATEGORIES.find(c => c.value === b.category)?.color
                    }));

                    setCategoryBudgets(updatedBudgets);
                    return;
                }

                // Utwórz nowe budżety tylko jeśli nie ma istniejących
                console.log("Inicjalizacja budżetów kategorii - tworzenie nowych budżetów");

                const expenseCategories = CATEGORIES.filter(cat =>
                    !["wynagrodzenie", "prezent", "inne_przychody"].includes(cat.value)
                );

                // Przygotuj dane dla batch upsert (jeśli API to obsługuje)
                const newBudgets = await Promise.all(expenseCategories.map(async (category) => {
                    const categoryTransactions = transactions.filter(t =>
                        t.category === category.value && t.type === "expense"
                    );
                    const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
                    const avgMonthly = categoryTransactions.length > 0 ? totalSpent / 3 : 0;
                    const defaultLimit = Math.ceil(avgMonthly * 1.2) || 500;

                    try {
                        // Utworzenie budżetu w bazie
                        const budget = await upsertCategoryBudget({
                            category: category.value,
                            limit: defaultLimit,
                            color: category.color
                        });

                        return {
                            ...budget,
                            spent: getCurrentMonthCategorySpending(transactions, category.value)
                        };
                    } catch (error) {
                        console.error(`Błąd przy inicjalizacji budżetu dla ${category.value}:`, error);
                        return {
                            category: category.value,
                            limit: defaultLimit,
                            spent: getCurrentMonthCategorySpending(transactions, category.value),
                            color: category.color
                        };
                    }
                }));

                setCategoryBudgets(newBudgets);
            } catch (error) {
                console.error("Błąd podczas inicjalizacji budżetów kategorii:", error);
            }
        };

        const normalizeGoals = (goals: any[]): BudgetGoal[] => {
            return goals.map(goal => ({
                ...goal,
                id: goal._id || goal.id // Zapewnij że zawsze jest id
            }));
        };

        // Pobieranie celów oszczędnościowych i budżetów kategorii z backendu
        useEffect(() => {
            const loadGoalsAndBudgets = async () => {
                try {
                    const [goals, budgets] = await Promise.all([
                        fetchSavingGoals(),
                        fetchCategoryBudgets()
                    ]);

                    // Normalizacja ID celów
                    setBudgetGoals(Array.isArray(goals) ? normalizeGoals(goals) : []);

                    // Jeśli mamy dane z API, zastąp nimi całkowicie dane demo
                    if (Array.isArray(budgets) && budgets.length > 0) {
                        setCategoryBudgets(budgets.map(b => ({
                            ...b,
                            spent: getCurrentMonthCategorySpending(transactions, b.category),
                            color: CATEGORIES.find(c => c.value === b.category)?.color
                        })));
                    }
                } catch (e) {
                    console.error("Błąd podczas pobierania celów i budżetów:", e);
                }
            };

            // Wywołaj funkcję tylko gdy transakcje są dostępne
            if (transactions.length > 0) {
                loadGoalsAndBudgets();
            }
        }, [transactions]);

        const handleGoalSave = async () => {
            if (!currentGoal) return;
            try {
                let updatedGoal: BudgetGoal;

                if (currentGoal.id) {
                    // Edycja istniejącego celu
                    updatedGoal = await updateSavingGoal(currentGoal.id, currentGoal);

                    // Zapewnij, że zwrócony cel ma pole id
                    updatedGoal = {
                        ...updatedGoal,
                        id: updatedGoal._id || updatedGoal.id
                    };

                    // Aktualizuj listę po id
                    setBudgetGoals(goals =>
                        goals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
                    );
                } else {
                    // Dodawanie nowego celu
                    updatedGoal = await addSavingGoal(currentGoal);

                    // Upewnij się, że nowy cel ma pole id
                    updatedGoal = {
                        ...updatedGoal,
                        id: updatedGoal._id || updatedGoal.id
                    };

                    setBudgetGoals(goals => [...goals, updatedGoal]);
                }

                handleGoalDialogClose();
            } catch (e) {
                console.error("Błąd podczas zapisywania celu:", e);
            }
        };

        // Usuwanie celu oszczędnościowego
        const handleGoalDelete = async (id: string | undefined) => {
            if (!id) {
                console.error("Próba usunięcia celu bez ID");
                return;
            }

            try {
                await deleteSavingGoal(id);
                setBudgetGoals(goals => goals.filter(g => g.id !== id && g._id !== id));
            } catch (error) {
                console.error("Błąd podczas usuwania celu oszczędnościowego:", error);
                alert("Nie udało się usunąć celu oszczędnościowego. Sprawdź konsolę po więcej szczegółów.");
            }
        };

        // Zmiana limitu budżetu kategorii
        const handleBudgetChange = async (category: string, newLimit: number) => {
            try {
                const updated = await upsertCategoryBudget({category, limit: newLimit});
                setCategoryBudgets(budgets =>
                    budgets.map(b => b.category === category ? {...b, ...updated} : b)
                );
            } catch (e) {
                // obsługa błędów
            }
        };

        const handleBudgetReset = async (category: string) => {
            try {
                const resetBudget = await resetCategoryBudget(category);

                // Dodaj pole spent do obiektu resetBudget
                const updatedBudget = {
                    ...resetBudget,
                    spent: getCurrentMonthCategorySpending(transactions, category),
                    color: CATEGORIES.find(c => c.value === category)?.color
                };

                setCategoryBudgets(budgets =>
                    budgets.map(b => b.category === category ? updatedBudget : b)
                );
            } catch (error) {
                console.error("Błąd podczas resetowania budżetu kategorii:", error);
                alert("Nie udało się zresetować budżetu kategorii");
            }
        };

        useEffect(() => {
            const alerts: BudgetAlert[] = [];
            categoryBudgets.forEach(budget => {
                // Sprawdź, czy limit jest większy od 0 - jeśli nie, pomijaj tworzenie alertu
                if (budget.limit > 0) {
                    const percentUsed = (budget.spent / budget.limit) * 100;
                    if (percentUsed >= 90) {
                        const category = CATEGORIES.find(c => c.value === budget.category);
                        alerts.push({
                            category: category?.label || budget.category,
                            percentUsed,
                            message: `Wykorzystano ${percentUsed.toFixed(0)}% budżetu dla kategorii ${category?.label || budget.category}`,
                            severity: percentUsed >= 100 ? 'error' : 'warning',
                            color: category?.color
                        });
                    }
                }
            });
            setBudgetAlerts(alerts);
        }, [categoryBudgets]);

        // Funkcja do obliczania wydatków w danej kategorii w bieżącym miesiącu
        const getCurrentMonthCategorySpending = (transactions: Transaction[], category: string) => {
            const now = new Date();
            const startOfCurrentMonth = startOfMonth(now);
            const endOfCurrentMonth = endOfMonth(now);

            return transactions
                .filter(t =>
                    t.category === category &&
                    t.type === "expense" &&
                    isWithinInterval(parseISO(t.date), {
                        start: startOfCurrentMonth,
                        end: endOfCurrentMonth
                    })
                )
                .reduce((sum, t) => sum + t.amount, 0);
        };

        // Obliczenia finansowe
        const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expense;

        // Dane do wykresu kołowego (przychody vs wydatki)
        const overviewData = [
            {name: "Przychody", value: income, color: "#4CAF50"},
            {name: "Wydatki", value: expense, color: "#F44336"}
        ];

        // Dane do wykresu kategorii wydatków
        const categoryData = CATEGORIES.map(category => {
            const amount = transactions
                .filter(t => t.category === category.value)
                .reduce((sum, t) => sum + t.amount, 0);
            return {
                name: category.label,
                value: amount,
                color: category.color
            };
        }).filter(item => item.value > 0);

        // Ostatnie transakcje
        const recentTransactions = [...transactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        // Kategorie z najwyższymi wydatkami
        const topExpenseCategories = [...categoryData]
            .filter(cat => {
                const category = CATEGORIES.find(c => c.label === cat.name);
                return category && !["wynagrodzenie", "prezent", "inne_przychody"].includes(category.value);
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 3);

        // Dane do trendu finansowego
        const getMonthlyData = () => {
            const months = 6; // Ostatnie 6 miesięcy
            const monthlyData = [];

            for (let i = 0; i < months; i++) {
                const monthDate = subMonths(new Date(), i);
                const monthStart = startOfMonth(monthDate);
                const monthEnd = endOfMonth(monthDate);
                const monthName = format(monthDate, 'LLL', {locale: plPL});

                const monthIncome = transactions
                    .filter(t =>
                        t.type === "income" &&
                        isWithinInterval(parseISO(t.date), {
                            start: monthStart,
                            end: monthEnd
                        })
                    )
                    .reduce((sum, t) => sum + t.amount, 0);

                const monthExpense = transactions
                    .filter(t =>
                        t.type === "expense" &&
                        isWithinInterval(parseISO(t.date), {
                            start: monthStart,
                            end: monthEnd
                        })
                    )
                    .reduce((sum, t) => sum + t.amount, 0);

                monthlyData.unshift({
                    name: monthName,
                    przychody: monthIncome,
                    wydatki: monthExpense,
                    saldo: monthIncome - monthExpense
                });
            }

            return monthlyData;
        };

        // Dane dla porównania okresów
        const getComparisonData = () => {
            const now = new Date();
            let currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd;

            // Ustawienie dat dla bieżącego okresu
            switch (comparisonPeriod.current) {
                case 'current_month':
                    currentPeriodStart = startOfMonth(now);
                    currentPeriodEnd = endOfMonth(now);
                    break;
                case 'previous_month':
                    currentPeriodStart = startOfMonth(subMonths(now, 1));
                    currentPeriodEnd = endOfMonth(subMonths(now, 1));
                    break;
                case 'two_months_ago':
                    currentPeriodStart = startOfMonth(subMonths(now, 2));
                    currentPeriodEnd = endOfMonth(subMonths(now, 2));
                    break;
                default:
                    currentPeriodStart = startOfMonth(now);
                    currentPeriodEnd = endOfMonth(now);
            }

            // Ustawienie dat dla poprzedniego okresu
            switch (comparisonPeriod.previous) {
                case 'current_month':
                    previousPeriodStart = startOfMonth(now);
                    previousPeriodEnd = endOfMonth(now);
                    break;
                case 'previous_month':
                    previousPeriodStart = startOfMonth(subMonths(now, 1));
                    previousPeriodEnd = endOfMonth(subMonths(now, 1));
                    break;
                case 'two_months_ago':
                    previousPeriodStart = startOfMonth(subMonths(now, 2));
                    previousPeriodEnd = endOfMonth(subMonths(now, 2));
                    break;
                case 'year_ago':
                    previousPeriodStart = startOfMonth(new Date(now.getFullYear() - 1, now.getMonth(), 1));
                    previousPeriodEnd = endOfMonth(new Date(now.getFullYear() - 1, now.getMonth(), 1));
                    break;
                default:
                    previousPeriodStart = startOfMonth(subMonths(now, 1));
                    previousPeriodEnd = endOfMonth(subMonths(now, 1));
            }

            // Obliczanie danych dla bieżącego okresu
            const currentIncome = transactions
                .filter(t =>
                    t.type === "income" &&
                    isWithinInterval(parseISO(t.date), {
                        start: currentPeriodStart,
                        end: currentPeriodEnd
                    })
                )
                .reduce((sum, t) => sum + t.amount, 0);

            const currentExpense = transactions
                .filter(t =>
                    t.type === "expense" &&
                    isWithinInterval(parseISO(t.date), {
                        start: currentPeriodStart,
                        end: currentPeriodEnd
                    })
                )
                .reduce((sum, t) => sum + t.amount, 0);

            // Obliczanie danych dla poprzedniego okresu
            const previousIncome = transactions
                .filter(t =>
                    t.type === "income" &&
                    isWithinInterval(parseISO(t.date), {
                        start: previousPeriodStart,
                        end: previousPeriodEnd
                    })
                )
                .reduce((sum, t) => sum + t.amount, 0);

            const previousExpense = transactions
                .filter(t =>
                    t.type === "expense" &&
                    isWithinInterval(parseISO(t.date), {
                        start: previousPeriodStart,
                        end: previousPeriodEnd
                    })
                )
                .reduce((sum, t) => sum + t.amount, 0);

            const currentPeriodName = format(currentPeriodStart, 'LLLL yyyy', {locale: plPL});
            const previousPeriodName = format(previousPeriodStart, 'LLLL yyyy', {locale: plPL});

            return [
                {
                    kategoria: "Przychody",
                    [currentPeriodName]: currentIncome,
                    [previousPeriodName]: previousIncome,
                    różnica: currentIncome - previousIncome
                },
                {
                    kategoria: "Wydatki",
                    [currentPeriodName]: currentExpense,
                    [previousPeriodName]: previousExpense,
                    różnica: currentExpense - previousExpense
                },
                {
                    kategoria: "Saldo",
                    [currentPeriodName]: currentIncome - currentExpense,
                    [previousPeriodName]: previousIncome - previousExpense,
                    różnica: (currentIncome - currentExpense) - (previousIncome - previousExpense)
                }
            ];
        };

        // Dane do prognozy finansowej
        const getForecastData = () => {
            const monthlyData = getMonthlyData();

            // Proste przewidywanie na podstawie średnich z ostatnich 3 miesięcy
            const last3Months = monthlyData.slice(-3);

            const avgIncome = last3Months.reduce((sum, month) => sum + month.przychody, 0) / 3;
            const avgExpense = last3Months.reduce((sum, month) => sum + month.wydatki, 0) / 3;

            // Przewidywanie na kolejne 3 miesiące
            const forecast = [];
            for (let i = 1; i <= 3; i++) {
                const forecastDate = addMonths(new Date(), i);
                forecast.push({
                    name: format(forecastDate, 'LLL', {locale: plPL}),
                    przychody: avgIncome,
                    wydatki: avgExpense,
                    saldo: avgIncome - avgExpense,
                    prognoza: true
                });
            }

            return [...monthlyData, ...forecast];
        };

        // Kalendarz finansowy - grupowanie transakcji według dat
        const getCalendarData = () => {
            const calendarData: Record<string, Transaction[]> = {};

            transactions.forEach(transaction => {
                const dateKey = transaction.date.split('T')[0];
                if (!calendarData[dateKey]) {
                    calendarData[dateKey] = [];
                }
                calendarData[dateKey].push(transaction);
            });

            return calendarData;
        };

        // Obsługa zmiany zakładki
        const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
            setActiveTab(newValue);
        };

        // Obsługa dialogu celów oszczędnościowych
        const handleGoalDialogOpen = (goal: BudgetGoal | null) => {
            setCurrentGoal(goal || {
                // NIE ustawiaj id: String(Date.now())
                name: '',
                targetAmount: 0,
                savedAmount: 0
            } as BudgetGoal);
            setGoalDialogOpen(true);
        };

        const handleGoalDialogClose = () => {
            setGoalDialogOpen(false);
            setCurrentGoal(null);
        };

        if (loading) {
            return (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '200px',
                    width: '100%'
                }}>
                    <Typography variant="h6" color="text.secondary">Ładowanie danych...</Typography>
                </Box>
            );
        }

        return (
            <Box sx={{py: 3}}>
                <Typography variant="h4" fontWeight="bold" mb={2} color="text.primary">
                    Twój budżet
                </Typography>

                {/* Alerty budżetowe */}
                {showBudgetAlerts && budgetAlerts.length > 0 && (
                    <Box mb={4}>
                        {budgetAlerts.map((alert, index) => (
                            <Alert
                                key={index}
                                severity={alert.severity}
                                icon={<WarningIcon style={{color: alert.color}}/>}
                                sx={{mb: 1}}
                                onClose={() => setShowBudgetAlerts(false)}
                            >
                                {alert.message}
                            </Alert>
                        ))}
                    </Box>
                )}

                {/* Karty statystyk */}
                <Grid container spacing={3} mb={4}>
                    <Grid size={{xs: 12, sm: 4}}>
                        <Card
                            elevation={3}
                            sx={{
                                borderRadius: 2,
                                height: '100%',
                                backgroundImage: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)',
                                transition: 'transform 0.3s',
                                '&:hover': {transform: 'translateY(-4px)'}
                            }}
                        >
                            <CardContent sx={{p: 3}}>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                    <TrendingUpIcon sx={{color: 'success.main', mr: 1, fontSize: 28}}/>
                                    <Typography variant="h6" color="text.secondary">
                                        Przychody
                                    </Typography>
                                </Box>
                                <Typography variant="h4" color="success.main" fontWeight="bold">
                                    {income.toFixed(2)} zł
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{xs: 12, sm: 4}}>
                        <Card
                            elevation={3}
                            sx={{
                                borderRadius: 2,
                                height: '100%',
                                backgroundImage: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)',
                                transition: 'transform 0.3s',
                                '&:hover': {transform: 'translateY(-4px)'}
                            }}
                        >
                            <CardContent sx={{p: 3}}>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                    <TrendingDownIcon sx={{color: 'error.main', mr: 1, fontSize: 28}}/>
                                    <Typography variant="h6" color="text.secondary">
                                        Wydatki
                                    </Typography>
                                </Box>
                                <Typography variant="h4" color="error.main" fontWeight="bold">
                                    {expense.toFixed(2)} zł
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{xs: 12, sm: 4}}>
                        <Card
                            elevation={3}
                            sx={{
                                borderRadius: 2,
                                height: '100%',
                                backgroundImage: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)',
                                transition: 'transform 0.3s',
                                '&:hover': {transform: 'translateY(-4px)'}
                            }}
                        >
                            <CardContent sx={{p: 3}}>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                    <AccountBalanceWalletIcon sx={{color: 'primary.main', mr: 1, fontSize: 28}}/>
                                    <Typography variant="h6" color="text.secondary">
                                        Saldo
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                    color={balance >= 0 ? 'success.main' : 'error.main'}
                                >
                                    {balance.toFixed(2)} zł
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Zakładki dla różnych widoków */}
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{mb: 3, borderBottom: 1, borderColor: 'divider'}}
                >
                    <Tab icon={<PieChartIcon/>} label="Przegląd"/>
                    <Tab icon={<ShowChartIcon/>} label="Trend finansowy"/>
                    <Tab icon={<CategoryIcon/>} label="Budżety kategorii"/>
                    <Tab icon={<SaveIcon/>} label="Cele oszczędnościowe"/>
                    <Tab icon={<CalendarTodayIcon/>} label="Kalendarz"/>
                    <Tab icon={<CompareArrowsIcon/>} label="Porównanie okresów"/>
                    <Tab icon={<TimelineIcon/>} label="Prognoza"/>
                    <Tab icon={<PieChartIcon/>} label="Analiza kategorii"/>
                </Tabs>

                {/* Przegląd - Panel główny */}
                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        {/* Wykres kołowy */}
                        <Grid size={{xs: 12, md: 6}}>
                            <Card
                                elevation={3}
                                sx={{
                                    borderRadius: 2,
                                    height: '100%',
                                    minHeight: 380,
                                    transition: 'all 0.3s',
                                    '&:hover': {boxShadow: '0 8px 24px rgba(0,0,0,0.12)'}
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" mb={2} fontWeight="medium">
                                        Przychody vs Wydatki
                                    </Typography>
                                    <Box sx={{height: 300, display: 'flex', justifyContent: 'center'}}>
                                        {transactions.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={overviewData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        label={({name, percent}) =>
                                                            `${name}: ${(percent * 100).toFixed(0)}%`
                                                        }
                                                        labelLine={false}
                                                        animationDuration={1000}
                                                    >
                                                        {overviewData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color}/>
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value) => [`${Number(value).toFixed(2)} zł`, ""]}
                                                    />
                                                    <Legend/>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '100%'
                                            }}>
                                                <Typography color="text.secondary">
                                                    Brak danych do wyświetlenia
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Wykres wydatków według kategorii */}
                        <Grid size={{xs: 12, md: 6}}>
                            <Card
                                elevation={3}
                                sx={{
                                    borderRadius: 2,
                                    height: '100%',
                                    minHeight: 380,
                                    transition: 'all 0.3s',
                                    '&:hover': {boxShadow: '0 8px 24px rgba(0,0,0,0.12)'}
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" mb={2} fontWeight="medium">
                                        Wydatki według kategorii
                                    </Typography>
                                    <Box sx={{height: 300}}>
                                        {transactions.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={categoryData.filter(item => item.value > 0)}
                                                    layout="vertical"
                                                    margin={{top: 5, right: 30, left: 20, bottom: 5}}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3"/>
                                                    <XAxis type="number"/>
                                                    <YAxis dataKey="name" type="category" width={100}/>
                                                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} zł`, ""]}/>
                                                    <Bar
                                                        dataKey="value"
                                                        name="Kwota"
                                                        animationDuration={1000}
                                                    >
                                                        {categoryData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`}
                                                                  fill={entry.color || COLORS[index % COLORS.length]}/>
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '100%'
                                            }}>
                                                <Typography color="text.secondary">
                                                    Brak danych do wyświetlenia
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Ostatnie transakcje */}
                        <Grid size={{xs: 12, md: 6}}>
                            <Card elevation={3} sx={{borderRadius: 2, height: '100%'}}>
                                <CardContent>
                                    <Typography variant="h6" mb={2} fontWeight="medium">
                                        Ostatnie transakcje
                                    </Typography>
                                    <List>
                                        {recentTransactions.length > 0 ? (
                                            recentTransactions.map(transaction => (
                                                <ListItem
                                                    key={transaction._id}
                                                    divider
                                                    sx={{py: 1.5}}
                                                    secondaryAction={
                                                        <Typography
                                                            variant="body1"
                                                            fontWeight="medium"
                                                            color={transaction.type === "income" ? "success.main" : "error.main"}
                                                        >
                                                            {transaction.type === "income" ? "+" : "-"}{transaction.amount.toFixed(2)} zł
                                                        </Typography>
                                                    }
                                                >
                                                    <ListItemIcon>
                                                        {transaction.type === "income"
                                                            ? <TrendingUpIcon color="success"/>
                                                            : <TrendingDownIcon color="error"/>}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={transaction.title}
                                                        secondary={format(parseISO(transaction.date), 'dd MMMM yyyy', {locale: plPL})}
                                                    />
                                                </ListItem>
                                            ))
                                        ) : (
                                            <Typography color="text.secondary" sx={{py: 2, textAlign: 'center'}}>
                                                Brak ostatnich transakcji
                                            </Typography>
                                        )}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Kategorie z najwyższymi wydatkami */}
                        <Grid size={{xs: 12, md: 6}}>
                            <Card elevation={3} sx={{borderRadius: 2, height: '100%'}}>
                                <CardContent>
                                    <Typography variant="h6" mb={2} fontWeight="medium">
                                        Najwyższe wydatki
                                    </Typography>
                                    <List>
                                        {topExpenseCategories.length > 0 ? (
                                            topExpenseCategories.map((category, index) => (
                                                <ListItem key={index} sx={{py: 1.5}}>
                                                    <ListItemIcon sx={{ color: category.color }}>
                                                        {CATEGORIES.find(c => c.label === category.name)?.icon || <CategoryIcon />}
                                                    </ListItemIcon>
                                                    <ListItemText primary={category.name}/>
                                                    <Typography variant="body1" fontWeight="medium" color="error.main">
                                                        {category.value.toFixed(2)} zł
                                                    </Typography>
                                                </ListItem>
                                            ))
                                        ) : (
                                            <Typography color="text.secondary" sx={{py: 2, textAlign: 'center'}}>
                                                Brak danych o wydatkach
                                            </Typography>
                                        )}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Trend finansowy */}
                {activeTab === 1 && (
                    <Card elevation={3} sx={{borderRadius: 2, p: 2}}>
                        <CardContent>
                            <Typography variant="h6" mb={2} fontWeight="medium">
                                Trend finansowy - ostatnie 6 miesięcy
                            </Typography>
                            <Box sx={{height: 400}}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={getMonthlyData()}
                                        margin={{top: 10, right: 30, left: 0, bottom: 0}}
                                    >
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="name"/>
                                        <YAxis/>
                                        <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} zł`, ""]}/>
                                        <Legend/>
                                        <Area
                                            type="monotone"
                                            dataKey="przychody"
                                            name="Przychody"
                                            stroke="#4CAF50"
                                            fill="#4CAF50"
                                            fillOpacity={0.2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="wydatki"
                                            name="Wydatki"
                                            stroke="#F44336"
                                            fill="#F44336"
                                            fillOpacity={0.2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="saldo"
                                            name="Saldo"
                                            stroke="#2196F3"
                                            fill="#2196F3"
                                            fillOpacity={0.2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Budżety kategorii */}
                {activeTab === 2 && (
                    <Box>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 3}}>
                            <Typography variant="h6" fontWeight="medium">
                                Budżety kategorii
                            </Typography>
                        </Box>
                        <Grid container spacing={3}>
                            {categoryBudgets.length > 0 ? (
                                categoryBudgets.map((budget, index) => (
                                    <Grid size={{xs: 12, sm: 6, md: 4}} key={index}>
                                        <Card elevation={3} sx={{borderRadius: 2}}>
                                            <CardContent>
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <Typography variant="h6" fontWeight="medium">
                                                        {CATEGORIES.find(c => c.value === budget.category)?.label || budget.category}
                                                    </Typography>
                                                    <CategoryIcon sx={{color: budget.color}}/>
                                                </Box>
                                                <Box sx={{mt: 2, mb: 1}}>
                                                    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                                        <Typography variant="subtitle1">
                                                            Wydano: {budget.spent.toFixed(2)} zł
                                                        </Typography>
                                                        <Typography variant="subtitle1">
                                                            Limit: {budget.limit > 0 ? `${budget.limit.toFixed(2)} zł` : "Brak limitu"}
                                                        </Typography>
                                                    </Box>
                                                    {budget.limit > 0 ? (
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={Math.min((budget.spent / budget.limit) * 100, 100)}
                                                            color={
                                                                budget.spent / budget.limit > 0.9 ? "error" :
                                                                    budget.spent / budget.limit > 0.7 ? "warning" : "primary"
                                                            }
                                                            sx={{height: 8, borderRadius: 5, mt: 1}}
                                                        />
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary" sx={{mt: 1, display: 'block'}}>
                                                            Brak ustalonego limitu dla tej kategorii
                                                        </Typography>
                                                    )}
                                                </Box>

                                                <TextField
                                                    label="Budżet miesięczny"
                                                    type="number"
                                                    size="small"
                                                    fullWidth
                                                    value={budget.limit}
                                                    onChange={(e) => handleBudgetChange(budget.category, Number(e.target.value))}
                                                    InputProps={{
                                                        endAdornment: <Typography variant="subtitle2">zł</Typography>
                                                    }}
                                                    sx={{mt: 2}}
                                                />

                                                <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
                                                    <IconButton
                                                        color="info"
                                                        onClick={() => handleBudgetReset(budget.category)}
                                                        title="Resetuj budżet"
                                                    >
                                                        <RestartAltIcon/>
                                                    </IconButton>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            ) : (
                                <Grid size={{xs: 12}}>
                                    <Typography color="text.secondary" sx={{py: 2, textAlign: 'center'}}>
                                        Brak zdefiniowanych budżetów kategorii
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                )}

                {/* Cele oszczędnościowe */
                }
                {
                    activeTab === 3 && (
                        <Box>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 3}}>
                                <Typography variant="h6" fontWeight="medium">
                                    Twoje cele oszczędnościowe
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon/>}
                                    onClick={() => handleGoalDialogOpen(null)}
                                >
                                    Nowy cel
                                </Button>
                            </Box>

                            <Grid container spacing={3}>
                                {Array.isArray(budgetGoals) && budgetGoals.length > 0 ? (
                                    budgetGoals.map((goal, index) => (
                                        <Grid size={{xs: 12, sm: 6, md: 4}} key={goal.id || goal._id || index}>
                                            <Card elevation={3} sx={{borderRadius: 2}}>
                                                <CardContent>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <Typography variant="h6" fontWeight="medium">
                                                            {goal.name}
                                                        </Typography>
                                                        <Box>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleGoalDialogOpen(goal)}
                                                                sx={{mr: 1}}
                                                            >
                                                                <EditIcon fontSize="small"/>
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleGoalDelete(goal.id || goal._id || undefined)}
                                                                color="error"
                                                            >
                                                                <DeleteIcon fontSize="small"/>
                                                            </IconButton>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{mt: 2, mb: 1}}>
                                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Zebrano: {goal.savedAmount.toFixed(2)} zł
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Cel: {goal.targetAmount.toFixed(2)} zł
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)}
                                                            sx={{height: 8, borderRadius: 5, mt: 1}}
                                                        />
                                                    </Box>

                                                    <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
                                                        Postęp: {((goal.savedAmount / goal.targetAmount) * 100).toFixed(0)}%
                                                    </Typography>

                                                    {goal.deadline && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Termin: {format(goal.deadline, 'dd MMMM yyyy', {locale: plPL})}
                                                        </Typography>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))) : (
                                    <Grid size={{xs: 12}}>
                                        <Typography color="text.secondary" sx={{py: 2, textAlign: 'center'}}>
                                            Brak celów oszczędnościowych do wyświetlenia
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )
                }

                {/* Kalendarz finansowy */
                }
                {
                    activeTab === 4 && (
                        <Card elevation={3} sx={{borderRadius: 2, p: 2}}>
                            <CardContent>
                                <Typography variant="h6" mb={3} fontWeight="medium">
                                    Kalendarz finansowy
                                </Typography>

                                {Object.entries(getCalendarData()).length > 0 ? (
                                    Object.entries(getCalendarData())
                                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                                        .map(([date, dayTransactions]) => (
                                            <Paper elevation={1} sx={{p: 2, mb: 2}} key={date}>
                                                <Typography variant="subtitle1" fontWeight="medium" mb={1}>
                                                    {format(parseISO(date), 'EEEE, d MMMM yyyy', {locale: plPL})}
                                                </Typography>
                                                <Divider sx={{mb: 2}}/>

                                                {dayTransactions.map(transaction => (
                                                    <Box
                                                        key={transaction._id}
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            mb: 1,
                                                            pb: 1,
                                                            borderBottom: '1px solid #f0f0f0'
                                                        }}
                                                    >
                                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                            {transaction.type === "income"
                                                                ? <TrendingUpIcon color="success" sx={{mr: 1}}/>
                                                                : <TrendingDownIcon color="error" sx={{mr: 1}}/>}
                                                            <Box>
                                                                <Typography variant="body1">
                                                                    {transaction.title}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {CATEGORIES.find(c => c.value === transaction.category)?.label || transaction.category}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                        <Typography
                                                            variant="body1"
                                                            fontWeight="medium"
                                                            color={transaction.type === "income" ? "success.main" : "error.main"}
                                                        >
                                                            {transaction.type === "income" ? "+" : "-"}{transaction.amount.toFixed(2)} zł
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Paper>
                                        ))
                                ) : (
                                    <Typography color="text.secondary" sx={{py: 2, textAlign: 'center'}}>
                                        Brak transakcji do wyświetlenia
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    )
                }

                {/* Porównanie okresów */
                }
                {
                    activeTab === 5 && (
                        <Card elevation={3} sx={{borderRadius: 2, p: 2}}>
                            <CardContent>
                                <Typography variant="h6" mb={3} fontWeight="medium">
                                    Porównanie okresów
                                </Typography>

                                <Grid container spacing={3} mb={3}>
                                    <Grid size={{xs: 12, sm: 6}}>
                                        <TextField
                                            select
                                            label="Bieżący okres"
                                            fullWidth
                                            value={comparisonPeriod.current}
                                            onChange={(e) => setComparisonPeriod(prev => ({...prev, current: e.target.value}))}
                                        >
                                            <MenuItem value="current_month">Bieżący miesiąc</MenuItem>
                                            <MenuItem value="previous_month">Poprzedni miesiąc</MenuItem>
                                            <MenuItem value="two_months_ago">Dwa miesiące temu</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid size={{xs: 12, sm: 6}}>
                                        <TextField
                                            select
                                            label="Okres do porównania"
                                            fullWidth
                                            value={comparisonPeriod.previous}
                                            onChange={(e) => setComparisonPeriod(prev => ({...prev, previous: e.target.value}))}
                                        >
                                            <MenuItem value="previous_month">Poprzedni miesiąc</MenuItem>
                                            <MenuItem value="two_months_ago">Dwa miesiące temu</MenuItem>
                                            <MenuItem value="year_ago">Rok temu</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>

                                <Box sx={{height: 400}}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={getComparisonData()}
                                            margin={{top: 20, right: 30, left: 20, bottom: 5}}
                                        >
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <XAxis dataKey="kategoria"/>
                                            <YAxis/>
                                            <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} zł`, ""]}/>
                                            <Legend/>
                                            <Bar
                                                dataKey={Object.keys(getComparisonData()[0])[1]}
                                                fill="#2196F3"
                                            />
                                            <Bar
                                                dataKey={Object.keys(getComparisonData()[0])[2]}
                                                fill="#FF9800"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    )
                }

                {/* Prognoza */
                }
                {
                    activeTab === 6 && (
                        <Card elevation={3} sx={{borderRadius: 2, p: 2}}>
                            <CardContent>
                                <Typography variant="h6" mb={2} fontWeight="medium">
                                    Prognoza finansowa
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Prognoza oparta na średnich z ostatnich 3 miesięcy
                                </Typography>

                                <Box sx={{height: 400}}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={getForecastData()}
                                            margin={{top: 10, right: 30, left: 0, bottom: 0}}
                                        >
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <XAxis dataKey="name"/>
                                            <YAxis/>
                                            <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} zł`, ""]}/>
                                            <Legend/>
                                            <Line
                                                type="monotone"
                                                dataKey="przychody"
                                                name="Przychody"
                                                stroke="#4CAF50"
                                                strokeWidth={2}
                                                dot={{r: 4}}
                                                activeDot={{r: 8}}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="wydatki"
                                                name="Wydatki"
                                                stroke="#F44336"
                                                strokeWidth={2}
                                                dot={{r: 4}}
                                                activeDot={{r: 8}}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="saldo"
                                                name="Saldo"
                                                stroke="#2196F3"
                                                strokeWidth={2}
                                                dot={{r: 4}}
                                                activeDot={{r: 8}}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    )
                }

                {/* Analiza kategorii */
                }
                {
                    activeTab === 7 && (
                        <Card elevation={3} sx={{borderRadius: 2, p: 2}}>
                            <CardContent>
                                <Typography variant="h6" mb={3} fontWeight="medium">
                                    Analiza wydatków według kategorii
                                </Typography>

                                <Box sx={{height: 400}}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData.filter(cat => {
                                                    const category = CATEGORIES.find(c => c.label === cat.name);
                                                    return category && !["wynagrodzenie", "prezent", "inne_przychody"].includes(category.value);
                                                })}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={120}
                                                fill="#8884d8"
                                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                labelLine={true}
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`}
                                                          fill={entry.color || COLORS[index % COLORS.length]}/>
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} zł`, ""]}/>
                                            <Legend/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    )
                }

                {/* Dialog do dodawania/edycji celów oszczędnościowych */
                }
                <Dialog open={goalDialogOpen} onClose={handleGoalDialogClose} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {currentGoal && currentGoal.name ? `Edytuj cel: ${currentGoal.name}` : 'Dodaj nowy cel'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Nazwa celu"
                            fullWidth
                            value={currentGoal?.name || ''}
                            onChange={(e) => setCurrentGoal({...currentGoal!, name: e.target.value})}
                            sx={{mb: 2, mt: 1}}
                        />
                        <TextField
                            margin="dense"
                            label="Kwota docelowa (zł)"
                            type="number"
                            fullWidth
                            value={currentGoal?.targetAmount || ''}
                            onChange={(e) => setCurrentGoal({...currentGoal!, targetAmount: Number(e.target.value)})}
                            sx={{mb: 2}}
                        />
                        <TextField
                            margin="dense"
                            label="Obecnie zaoszczędzone (zł)"
                            type="number"
                            fullWidth
                            value={currentGoal?.savedAmount || ''}
                            onChange={(e) => setCurrentGoal({...currentGoal!, savedAmount: Number(e.target.value)})}
                            sx={{mb: 2}}
                        />
                        <TextField
                            margin="dense"
                            label="Termin (opcjonalnie)"
                            type="date"
                            fullWidth
                            InputLabelProps={{shrink: true}}
                            value={currentGoal?.deadline ? format(currentGoal.deadline, 'yyyy-MM-dd') : ''}
                            onChange={(e) => setCurrentGoal({
                                ...currentGoal!,
                                deadline: e.target.value ? new Date(e.target.value) : undefined
                            })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleGoalDialogClose} color="inherit">Anuluj</Button>
                        <Button onClick={handleGoalSave} variant="contained" color="primary">Zapisz</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        )
            ;
    }
;

export default Dashboard;