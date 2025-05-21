import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Box } from "@mui/material";

interface LoginValues {
    email: string;
    password: string;
}

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const formik = useFormik<LoginValues>({
        initialValues: { email: "", password: "" },
        validationSchema: Yup.object({
            email: Yup.string().email("Niepoprawny email").required("Wymagane"),
            password: Yup.string().required("Wymagane"),
        }),
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                const res = await API.post("/api/auth/login", values);
                localStorage.setItem("token", res.data.token);
                navigate("/dashboard");
            } catch (err) {
                setErrors({ password: "Nieprawidłowy email lub hasło" });
            }
            setSubmitting(false);
        },
    });

    return (
        <Box maxWidth={400} mx="auto" mt={8}>
            <Typography variant="h5" mb={2}>Logowanie</Typography>
            <form onSubmit={formik.handleSubmit}>
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
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                    Zaloguj się
                </Button>
            </form>
        </Box>
    );
};

export default LoginPage;