import React from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import type {Transaction} from "../types";
import {updateTransaction} from "../api/transaction";
import {Button, TextField, MenuItem, Box} from "@mui/material";
import {CATEGORIES} from "../constants";

interface Props {
    transaction: Transaction;
    afterSubmit: () => void;
    onCancel: () => void;
}

const EditTransactionForm: React.FC<Props> = ({
                                                  transaction,
                                                  afterSubmit,
                                                  onCancel
                                              }) => {
    const formik = useFormik({
        initialValues: {
            amount: transaction.amount.toString(),
            type: transaction.type,
            category: transaction.category,
            date: new Date(transaction.date).toISOString().split("T")[0],
            description: transaction.description || "",
        },
        validationSchema: Yup.object({
            amount: Yup.number().typeError("Wprowadź liczbę").required("Wymagane"),
            type: Yup.string().oneOf(["income", "expense"]).required(),
            category: Yup.string().required("Wymagane"),
            date: Yup.string().required("Wymagane"),
        }),
        onSubmit: async (
            values: {
                amount: string;
                type: string;
                category: string;
                date: string;
                description: string;
            },
            {setSubmitting}: { setSubmitting: (isSubmitting: boolean) => void }
        ) => {
            try {
                await updateTransaction(transaction._id, {
                    ...values,
                    amount: Number(values.amount),
                    type: values.type as "income" | "expense"
                });
                afterSubmit();
            } catch (err) {
                console.error("Błąd podczas aktualizacji:", err);
            }
            setSubmitting(false);
        },
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <TextField
                label="Kwota"
                fullWidth
                margin="normal"
                {...formik.getFieldProps("amount")}
                error={!!formik.errors.amount && formik.touched.amount}
                helperText={formik.touched.amount && formik.errors.amount}
            />
            <TextField
                label="Typ"
                select
                fullWidth
                margin="normal"
                {...formik.getFieldProps("type")}
            >
                <MenuItem value="income">Przychód</MenuItem>
                <MenuItem value="expense">Wydatek</MenuItem>
            </TextField>
            <TextField
                label="Kategoria"
                select
                fullWidth
                margin="normal"
                {...formik.getFieldProps("category")}
                error={!!formik.errors.category && formik.touched.category}
                helperText={formik.touched.category && formik.errors.category}
            >
                {CATEGORIES.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                ))}
            </TextField>
            <TextField
                label="Data"
                type="date"
                fullWidth
                margin="normal"
                {...formik.getFieldProps("date")}
                slotProps={{inputLabel: {shrink: true}}}
                error={!!formik.errors.date && formik.touched.date}
                helperText={formik.touched.date && formik.errors.date}
            />
            <TextField
                label="Opis"
                fullWidth
                margin="normal"
                {...formik.getFieldProps("description")}
            />
            <Box sx={{display: "flex", gap: 2, mt: 2}}>
                <Button
                    type="button"
                    variant="outlined"
                    fullWidth
                    onClick={onCancel}
                >
                    Anuluj
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={formik.isSubmitting}
                >
                    Aktualizuj
                </Button>
            </Box>
        </form>
    );
};

export default EditTransactionForm;