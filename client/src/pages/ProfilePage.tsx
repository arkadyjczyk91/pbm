import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, TextField, Typography, Box, Tabs, Tab, Snackbar, Alert } from "@mui/material";
import { User } from "../types";
import { getCurrentUser, updateUserProfile, changePassword } from "../api/auth";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data);
      } catch (err) {
        console.error("Błąd pobierania danych użytkownika:", err);
      }
    };
    fetchUser();
  }, []);

  const profileForm = useFormik({
    initialValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      username: Yup.string().min(3, "Min 3 znaki").required("Wymagane"),
      email: Yup.string().email("Niepoprawny email").required("Wymagane"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateUserProfile(values);
        setSnackbar({
          open: true,
          message: "Profil zaktualizowany pomyślnie",
          severity: "success",
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Błąd podczas aktualizacji profilu",
          severity: "error",
        });
      }
      setSubmitting(false);
    },
  });

  const passwordForm = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Wymagane"),
      newPassword: Yup.string()
        .min(8, "Min. 8 znaków")
        .matches(/[0-9]/, "Min. 1 cyfra")
        .matches(/[A-Za-z]/, "Min. 1 litera")
        .matches(/[!@#$%^&*]/, "Min. 1 znak specjalny")
        .required("Wymagane"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), ""], "Hasła muszą być takie same")
        .required("Wymagane"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        resetForm();
        setSnackbar({
          open: true,
          message: "Hasło zmienione pomyślnie",
          severity: "success",
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Błąd podczas zmiany hasła",
          severity: "error",
        });
      }
      setSubmitting(false);
    },
  });

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Typography variant="h4" mb={3}>Twój profil</Typography>

      <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)} sx={{ mb: 3 }}>
        <Tab label="Dane profilu" />
        <Tab label="Zmiana hasła" />
      </Tabs>

      {tabIndex === 0 && (
        <form onSubmit={profileForm.handleSubmit}>
          <TextField
            label="Nazwa użytkownika"
            fullWidth
            margin="normal"
            {...profileForm.getFieldProps("username")}
            error={!!profileForm.errors.username && profileForm.touched.username}
            helperText={profileForm.touched.username && profileForm.errors.username}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            {...profileForm.getFieldProps("email")}
            error={!!profileForm.errors.email && profileForm.touched.email}
            helperText={profileForm.touched.email && profileForm.errors.email}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={profileForm.isSubmitting}
          >
            Aktualizuj profil
          </Button>
        </form>
      )}

      {tabIndex === 1 && (
        <form onSubmit={passwordForm.handleSubmit}>
          <TextField
            label="Obecne hasło"
            type="password"
            fullWidth
            margin="normal"
            {...passwordForm.getFieldProps("currentPassword")}
            error={!!passwordForm.errors.currentPassword && passwordForm.touched.currentPassword}
            helperText={passwordForm.touched.currentPassword && passwordForm.errors.currentPassword}
          />
          <TextField
            label="Nowe hasło"
            type="password"
            fullWidth
            margin="normal"
            {...passwordForm.getFieldProps("newPassword")}
            error={!!passwordForm.errors.newPassword && passwordForm.touched.newPassword}
            helperText={passwordForm.touched.newPassword && passwordForm.errors.newPassword}
          />
          <TextField
            label="Potwierdź nowe hasło"
            type="password"
            fullWidth
            margin="normal"
            {...passwordForm.getFieldProps("confirmPassword")}
            error={!!passwordForm.errors.confirmPassword && passwordForm.touched.confirmPassword}
            helperText={passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={passwordForm.isSubmitting}
          >
            Zmień hasło
          </Button>
        </form>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({...prev, open: false}))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({...prev, open: false}))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;