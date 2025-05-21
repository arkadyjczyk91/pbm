import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, TextField, MenuItem } from "@mui/material";
import { addTransaction } from "../api/transaction";
import {CATEGORIES} from "../constants.ts";


interface Props {
    afterSubmit: () => void;
}

const AddTransactionForm: React.FC<Props> = ({ afterSubmit }) => {
    const formik = useFormik({
        initialValues: {
            amount: "",
            type: "expense",
            category: "",
            date: new Date().toISOString().split("T")[0],
            description: "",
        },
        validationSchema: Yup.object({
            amount: Yup.number().typeError("Wprowadź liczbę").required("Wymagane"),
            type: Yup.string().oneOf(["income", "expense"]).required(),
            category: Yup.string().required("Wymagane"),
            date: Yup.string().required("Wymagane"),
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                await addTransaction({
                    ...values,
                    amount: Number(values.amount)
                });
                resetForm();
                afterSubmit();
            } catch (err) {
                // obsługa błędu
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
                InputLabelProps={{ shrink: true }}
                error={!!formik.errors.date && formik.touched.date}
                helperText={formik.touched.date && formik.errors.date}
            />
            <TextField
                label="Opis"
                fullWidth
                margin="normal"
                {...formik.getFieldProps("description")}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Dodaj
            </Button>
        </form>
    );
};

export default AddTransactionForm;