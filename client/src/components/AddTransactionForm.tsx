import React from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {
    Button,
    TextField,
    MenuItem,
    Box,
    Card,
    CardContent,
    Typography,
    InputAdornment
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {addTransaction} from "../api/transaction";
import {CATEGORIES} from "../constants.tsx";
import SaveIcon from '@mui/icons-material/Save';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PaidIcon from '@mui/icons-material/Paid';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DescriptionIcon from '@mui/icons-material/Description';
import CategoryIcon from '@mui/icons-material/Category';
import { useTheme } from "@mui/material/styles";

interface Props {
    afterSubmit: () => void;
}

const AddTransactionForm: React.FC<Props> = ({afterSubmit}) => {
    const theme = useTheme();

    const formik = useFormik({
        initialValues: {
            amount: "",
            type: "expense",
            category: "",
            date: new Date().toISOString().split("T")[0],
            title: "",
            description: "",
        },
        validationSchema: Yup.object({
            amount: Yup.number().typeError("Wprowadź liczbę").required("Wymagane"),
            type: Yup.string().oneOf(["income", "expense"]).required(),
            category: Yup.string().required("Wymagane"),
            title: Yup.string().required("Wymagane"),
            date: Yup.string().required("Wymagane"),
        }),
        onSubmit: async (values, {setSubmitting, resetForm}) => {
            try {
                await addTransaction({
                    ...values,
                    amount: Number(values.amount),
                    type: values.type as "income" | "expense",
                    title: values.title
                });
                resetForm();
                afterSubmit();
            } catch (err) {
                // obsługa błędu
            }
            setSubmitting(false);
        },
    });

    // Filtrowanie kategorii na podstawie wybranego typu
    const filteredCategories = CATEGORIES.filter(cat => {
        if (formik.values.type === "income") {
            return ["wynagrodzenie", "prezent", "inne_przychody"].includes(cat.value);
        } else {
            return !["wynagrodzenie", "prezent", "inne_przychody"].includes(cat.value);
        }
    });

    return (
        <Card
            elevation={3}
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                background: theme.palette.background.paper,
                transition: 'transform 0.3s',
                '&:hover': {
                    transform: 'translateY(-5px)'
                }
            }}
        >
            <CardContent sx={{p: 3}}>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        textAlign: 'center',
                        mb: 3,
                        fontWeight: 'bold',
                        color: formik.values.type === 'income' ? '#2e7d32' : '#d32f2f'
                    }}
                >
                    {formik.values.type === 'income' ? 'Nowy przychód' : 'Nowy wydatek'}
                </Typography>

                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <TextField
                                label="Kwota"
                                fullWidth
                                {...formik.getFieldProps("amount")}
                                error={!!formik.errors.amount && formik.touched.amount}
                                helperText={formik.touched.amount && formik.errors.amount}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            {formik.values.type === 'income' ? <PaidIcon color="success"/> :
                                                <MoneyOffIcon color="error"/>}
                                        </InputAdornment>
                                    ),
                                    endAdornment: <InputAdornment position="end">PLN</InputAdornment>
                                }}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Typ"
                                select
                                fullWidth
                                {...formik.getFieldProps("type")}
                                variant="outlined"
                            >
                                <MenuItem value="income">
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                        <PaidIcon sx={{color: 'success.main', mr: 1}}/>
                                        Przychód
                                    </Box>
                                </MenuItem>
                                <MenuItem value="expense">
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                        <MoneyOffIcon sx={{color: 'error.main', mr: 1}}/>
                                        Wydatek
                                    </Box>
                                </MenuItem>
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Tytuł"
                                fullWidth
                                {...formik.getFieldProps("title")}
                                variant="outlined"
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Kategoria"
                                select
                                fullWidth
                                {...formik.getFieldProps("category")}
                                error={!!formik.errors.category && formik.touched.category}
                                helperText={formik.touched.category && formik.errors.category}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CategoryIcon/>
                                        </InputAdornment>
                                    )
                                }}
                                variant="outlined"
                            >
                                {filteredCategories.map(cat => (
                                    <MenuItem key={cat.value} value={cat.value}>
                                        {cat.icon && (
                                            <Box sx={{color: cat.color, mr: 1}}>
                                                {cat.icon}
                                            </Box>
                                        )}
                                        {cat.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Data"
                                type="date"
                                fullWidth
                                {...formik.getFieldProps("date")}
                                InputLabelProps={{shrink: true}}
                                error={!!formik.errors.date && formik.touched.date}
                                helperText={formik.touched.date && formik.errors.date}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DateRangeIcon/>
                                        </InputAdornment>
                                    )
                                }}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Opis"
                                fullWidth
                                {...formik.getFieldProps("description")}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DescriptionIcon/>
                                        </InputAdornment>
                                    )
                                }}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                            mt: 3,
                            py: 1.5,
                            background: formik.values.type === 'income'
                                ? 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)'
                                : 'linear-gradient(45deg, #D32F2F 30%, #F44336 90%)',
                            boxShadow: formik.values.type === 'income'
                                ? '0 3px 5px 2px rgba(76, 175, 80, .3)'
                                : '0 3px 5px 2px rgba(244, 67, 54, .3)',
                            '&:hover': {
                                background: formik.values.type === 'income'
                                    ? 'linear-gradient(45deg, #1B5E20 30%, #388E3C 90%)'
                                    : 'linear-gradient(45deg, #B71C1C 30%, #D32F2F 90%)',
                            }
                        }}
                        startIcon={<SaveIcon/>}
                        disabled={formik.isSubmitting}
                    >
                        Zapisz {formik.values.type === 'income' ? 'przychód' : 'wydatek'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default AddTransactionForm;