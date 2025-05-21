import React, { useState, useEffect } from 'react';
  import {
    Box, Typography, Avatar, Card, CardContent, Button,
    Grid, Divider, Chip, CircularProgress, useTheme
  } from '@mui/material';
  import EditIcon from '@mui/icons-material/Edit';
  import LogoutIcon from '@mui/icons-material/Logout';
  import NightlightIcon from '@mui/icons-material/Nightlight';
  import LightModeIcon from '@mui/icons-material/LightMode';
  import DownloadIcon from '@mui/icons-material/Download';
  import { Line } from 'react-chartjs-2';
  import { getUserInfo, logout } from '../api/auth';
  import { useNavigate } from 'react-router-dom';

  const ProfilePage = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
      const loadUser = async () => {
        try {
          const userData = await getUserInfo();
          setUser(userData);
        } catch (error) {
          console.error("Błąd podczas ładowania danych użytkownika:", error);
        } finally {
          setLoading(false);
        }
      };

      loadUser();
    }, []);

    const handleLogout = async () => {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error("Błąd podczas wylogowywania:", error);
      }
    };

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    // Dane do wykresu aktywności
    const activityData = {
      labels: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec'],
      datasets: [
        {
          label: 'Liczba transakcji',
          data: [12, 19, 3, 5, 2, 3],
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.main + '20',
          fill: true,
        },
      ],
    };

    return (
      <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
        <Grid container spacing={3}>
          {/* Główna karta profilu */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: `4px solid ${theme.palette.primary.main}`
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {user?.name || 'Użytkownik'}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {user?.email || 'email@przykład.com'}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Chip
                    label="Aktywny użytkownik"
                    color="success"
                    sx={{ fontWeight: 'medium' }}
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Edytuj profil
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ borderRadius: 2 }}
                  >
                    Wyloguj się
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Aktywność użytkownika */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-5px)' }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Twoja aktywność
                    </Typography>
                    <Box sx={{ height: 300, mt: 2 }}>
                      <Line data={activityData} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Ustawienia aplikacji */}
              <Grid item xs={12}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-5px)' }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Ustawienia aplikacji
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={theme.palette.mode === 'dark' ? <LightModeIcon /> : <NightlightIcon />}
                          sx={{ borderRadius: 2, py: 1.5 }}
                        >
                          {theme.palette.mode === 'dark' ? 'Tryb jasny' : 'Tryb ciemny'}
                        </Button>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          sx={{ borderRadius: 2, py: 1.5 }}
                        >
                          Zainstaluj aplikację (PWA)
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    );
  };

  export default ProfilePage;