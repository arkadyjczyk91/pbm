import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

type NavbarProps = {
    darkMode: boolean;
    setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

function Navbar({ darkMode, setDarkMode }: NavbarProps) {
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
                <IconButton onClick={() => setDarkMode((prev) => !prev)} color="inherit" sx={{ ml: 2 }}>
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;