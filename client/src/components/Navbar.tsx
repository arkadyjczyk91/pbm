import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const isLogged = !!localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component={Link} to="/dashboard" sx={{ flexGrow: 1, textDecoration: "none", color: "#fff" }}>
                    Budget App
                </Typography>
                {isLogged ? (
                    <Box>
                        <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
                        <Button color="inherit" component={Link} to="/transactions">Transakcje</Button>
                        <Button color="inherit" component={Link} to="/profile">Profil</Button>
                        <Button color="inherit" onClick={handleLogout}>Wyloguj</Button>
                    </Box>
                ) : (
                    <Box>
                        <Button color="inherit" component={Link} to="/login">Logowanie</Button>
                        <Button color="inherit" component={Link} to="/register">Rejestracja</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;