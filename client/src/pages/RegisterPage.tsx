import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Box } from "@mui/material";

interface RegisterValues {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    const formik = useFormik<RegisterValues>({
        initialValues: { username: "", email: "", password: "", confirmPassword: "" },
        validationSchema: Yup.object({
            username: Yup.string().min(3, "Min 3 znaki").required("Wymagane"),
            email: Yup.string().email("Niepoprawny email").required("Wymagane"),
            password: Yup.string()
                .min(8, "Min. 8 znaków")
                .matches(/[0-9]/, "Min. 1 cyfra")
                .matches(/[A-Za-z]/, "Min. 1 litera")
                .matches(/[!@#$%^&*]/, "Min. 1 znak specjalny")
                .required("Wymagane"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password"), ""], "Hasła muszą być takie same")
                .required("Wymagane"),
        }),
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                await API.post("/api/auth/register", values);
                navigate("/login");
            } catch (err) {
                setErrors({ email: "Adres email jest już zajęty" });
            }
            setSubmitting(false);
        },
    });

    return (
        <Box maxWidth={400} mx="auto" mt={8}>
            <Typography variant="h5" mb={2}>Rejestracja</Typography>
            <form onSubmit={formik.handleSubmit}>
                <TextField
                    label="Nazwa użytkownika"
                    fullWidth
                    margin="normal"
                    {...formik.getFieldProps("username")}
                    error={!!formik.errors.username && formik.touched.username}
                    helperText={formik.touched.username && formik.errors.username}
                />
                <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    {...formik.getFieldProps("email")}
                    error={!!formik.errors.email && formik.touched.email}
                    helperText={formik.touched.email && formik.errors.email}
                />
                <TextField
                    label="Hasło"
                    type="password"
                    fullWidth
                    margin="normal"
                    {...formik.getFieldProps("password")}
                    error={!!formik.errors.password && formik.touched.password}
                    helperText={formik.touched.password && formik.errors.password}
                />
                <TextField
                    label="Powtórz hasło"
                    type="password"
                    fullWidth
                    margin="normal"
                    {...formik.getFieldProps("confirmPassword")}
                    error={!!formik.errors.confirmPassword && formik.touched.confirmPassword}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                    Zarejestruj się
                </Button>
            </form>
        </Box>
    );
};

export default RegisterPage;