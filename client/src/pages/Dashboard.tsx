import React, { useEffect, useState } from "react";
import API from "../api/api";
import { Transaction } from "../types";
import { Box, Typography } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#FF8042"];

const Dashboard: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        API.get("/api/transactions")
            .then((res) => setTransactions(res.data))
            .catch(() => {});
    }, []);

    const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const data = [
        { name: "Przychody", value: income },
        { name: "Wydatki", value: expense }
    ];

    return (
        <Box>
            <Typography variant="h4" mb={4}>Twój budżet</Typography>
            <PieChart width={300} height={300}>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
            <Typography variant="h6" mt={2}>Saldo: {income - expense} zł</Typography>
        </Box>
    );
};

export default Dashboard;