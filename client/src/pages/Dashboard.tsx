import React, {useEffect, useState} from "react";
import API from "../api/api";
import type {Transaction} from "../types";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip
} from "@mui/material";
import Grid from "@mui/material/Grid";
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
    CartesianGrid
} from "recharts";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import {CATEGORIES} from "../constants.ts";

const COLORS = ["#4CAF50", "#F44336", "#2196F3", "#FF9800", "#9C27B0", "#00BCD4", "#795548", "#607D8B"];

const Dashboard: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        API.get("/api/transactions")
            .then((res) => {
                setTransactions(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

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
            <Typography variant="h4" fontWeight="bold" mb={4} color="text.primary">
                Twój budżet
            </Typography>

            {/* Karty statystyk */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, sm: 4 }}>
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

                <Grid size={{ xs: 12, sm: 4 }}>
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

                <Grid size={{ xs: 12, sm: 4 }}>
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

            {/* Wykresy i statystyki */}
            <Grid container spacing={3}>
                {/* Wykres kołowy */}
                <Grid size={{ xs: 12, md: 6 }}>
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
                <Grid size={{ xs: 12, md: 6 }}>
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
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 2,
                            height: '100%',
                            minHeight: 350,
                            transition: 'all 0.3s',
                            '&:hover': {boxShadow: '0 8px 24px rgba(0,0,0,0.12)'}
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" mb={2} fontWeight="medium">
                                Ostatnie transakcje
                            </Typography>
                            {recentTransactions.length > 0 ? (
                                <List>
                                    {recentTransactions.map((transaction) => {
                                        const category = CATEGORIES.find(c => c.value === transaction.category);

                                        return (
                                            <React.Fragment key={transaction._id}>
                                                <ListItem
                                                    alignItems="flex-start"
                                                    sx={{
                                                        px: 2,
                                                        borderRadius: 1,
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0, 0, 0, 0.04)'
                                                        }
                                                    }}
                                                >
                                                    <ListItemIcon>
                                                        {category?.icon && (
                                                            <Box
                                                                component={category.icon}
                                                                sx={{
                                                                    color: category.color,
                                                                    fontSize: 28
                                                                }}
                                                            />
                                                        )}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Box
                                                                sx={{display: 'flex', justifyContent: 'space-between'}}>
                                                                <Typography fontWeight="medium">
                                                                    {transaction.description || category?.label || "Transakcja"}
                                                                </Typography>
                                                                <Typography
                                                                    fontWeight="bold"
                                                                    color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                                                                >
                                                                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} zł
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <React.Fragment>
                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    mt: 0.5
                                                                }}>
                                                                    <Chip
                                                                        label={category?.label}
                                                                        size="small"
                                                                        sx={{
                                                                            mr: 1,
                                                                            bgcolor: category?.color,
                                                                            color: 'white'
                                                                        }}
                                                                    />
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {new Date(transaction.date).toLocaleDateString()}
                                                                    </Typography>
                                                                </Box>
                                                            </React.Fragment>
                                                        }
                                                    />
                                                </ListItem>
                                                <Divider variant="inset" component="li"/>
                                            </React.Fragment>
                                        );
                                    })}
                                </List>
                            ) : (
                                <Box
                                    sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200}}>
                                    <Typography color="text.secondary">
                                        Brak transakcji do wyświetlenia
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top wydatki według kategorii */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 2,
                            height: '100%',
                            minHeight: 350,
                            transition: 'all 0.3s',
                            '&:hover': {boxShadow: '0 8px 24px rgba(0,0,0,0.12)'}
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" mb={2} fontWeight="medium">
                                Najwyższe wydatki
                            </Typography>
                            {topExpenseCategories.length > 0 ? (
                                <List>
                                    {topExpenseCategories.map((category, index) => {
                                        const categoryObj = CATEGORIES.find(c => c.label === category.name);
                                        const percentage = expense > 0 ? (category.value / expense) * 100 : 0;

                                        return (
                                            <ListItem key={index} sx={{px: 0}}>
                                                <ListItemIcon>
                                                    {categoryObj?.icon && (
                                                        <Box
                                                            component={categoryObj.icon}
                                                            sx={{
                                                                color: categoryObj.color,
                                                                fontSize: 28
                                                            }}
                                                        />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                                            <Typography fontWeight="medium">{category.name}</Typography>
                                                            <Typography fontWeight="bold" color="error.main">
                                                                {category.value.toFixed(2)} zł
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box sx={{mt: 1}}>
                                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                                <Box
                                                                    sx={{
                                                                        flexGrow: 1,
                                                                        mr: 2,
                                                                        bgcolor: 'grey.300',
                                                                        borderRadius: 5,
                                                                        height: 8
                                                                    }}
                                                                >
                                                                    <Box
                                                                        sx={{
                                                                            width: `${percentage}%`,
                                                                            bgcolor: categoryObj?.color || 'primary.main',
                                                                            height: '100%',
                                                                            borderRadius: 5
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Typography variant="body2">
                                                                    {percentage.toFixed(0)}%
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            ) : (
                                <Box
                                    sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200}}>
                                    <Typography color="text.secondary">
                                        Brak danych do wyświetlenia
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;