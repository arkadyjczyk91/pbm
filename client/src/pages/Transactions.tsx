import React, {useEffect, useState} from "react";
import type { Transaction } from "../types";
import { fetchAllTransactions, deleteTransaction } from "../api/transaction";
import {Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Modal} from "@mui/material";
import AddTransactionForm from "../components/AddTransactionForm";
import TransactionFilters from "../components/TransactionFilters";
import EditTransactionForm from "../components/EditTransactionForm";
import { useTheme } from "@mui/material/styles";

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [open, setOpen] = useState(false);
    const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        type: "",
        category: ""
    });
    const theme = useTheme();

    const filteredTransactions = transactions.filter(t => {
        // Filtr po typie
        if (filters.type && t.type !== filters.type) return false;

        // Filtr po kategorii
        if (filters.category && t.category !== filters.category) return false;

        // Filtr po dacie początkowej
        if (filters.startDate && new Date(t.date) < new Date(filters.startDate)) return false;

        // Filtr po dacie końcowej
        return !(filters.endDate && new Date(t.date) > new Date(filters.endDate));

    });

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({...prev, [name]: value}));
    };

    const resetFilters = () => {
        setFilters({
            startDate: "",
            endDate: "",
            type: "",
            category: ""
        });
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetchAllTransactions(); // Użycie metody z transaction.ts
            setTransactions(res.data);
        } catch (err) {
            console.error("Błąd podczas pobierania transakcji:", err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTransaction(id); // Użycie metody z transaction.ts
            await fetchTransactions();
        } catch (err) {
            console.error("Błąd podczas usuwania transakcji:", err);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);


    return (
        <Box mt={4}>
            <Typography variant="h5" mb={2}>Twoje transakcje</Typography>
            <Button variant="contained" sx={{mb: 2}} onClick={() => setOpen(true)}>
                Dodaj transakcję
            </Button>

            <TransactionFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
            />

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Kategoria</TableCell>
                        <TableCell>Kwota</TableCell>
                        <TableCell>Typ</TableCell>
                        <TableCell>Data</TableCell>
                        <TableCell>Opis</TableCell>
                        <TableCell>Akcje</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredTransactions.map((t) => (
                        <TableRow key={t._id}>
                            <TableCell>{t.category}</TableCell>
                            <TableCell>{t.amount} zł</TableCell>
                            <TableCell>{t.type === "income" ? "Przychód" : "Wydatek"}</TableCell>
                            <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                            <TableCell>{t.description}</TableCell>
                            <TableCell>
                                <Button
                                    sx={{mr: 1}}
                                    color="primary"
                                    onClick={() => setEditTransaction(t)}
                                >
                                    Edytuj
                                </Button>
                                <Button
                                    color="error"
                                    onClick={() => handleDelete(t._id)}
                                >
                                    Usuń
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Modal dodawania transakcji */}
            <Modal open={open} onClose={() => setOpen(false)}>
                <Box
                    sx={{
                        p: 4,
                        background: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        maxWidth: 400,
                        margin: "100px auto",
                        borderRadius: 2
                    }}
                >
                    <AddTransactionForm afterSubmit={() => {
                        setOpen(false);
                        fetchTransactions();
                    }}/>
                </Box>
            </Modal>

            {/* Modal edycji transakcji */}
            <Modal
                open={!!editTransaction}
                onClose={() => setEditTransaction(null)}
            >
                <Box
                    sx={{
                        p: 4,
                        background: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        maxWidth: 400,
                        margin: "100px auto",
                        borderRadius: 2
                    }}
                >
                    {editTransaction && (
                        <EditTransactionForm
                            transaction={editTransaction}
                            afterSubmit={() => {
                                setEditTransaction(null);
                                fetchTransactions();
                            }}
                            onCancel={() => setEditTransaction(null)}
                        />
                    )}
                </Box>
            </Modal>
        </Box>
    );
};

export default Transactions;