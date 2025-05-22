import {useState, useEffect, useRef} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import {
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import {alpha, useTheme} from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import {Line} from 'react-chartjs-2';
import {getCurrentUser as getUserInfo, updateUserProfile, changePassword} from '../api/auth';
import {fetchAllTransactions} from '../api/transaction';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    Filler,
    type ChartOptions
} from 'chart.js';
import {usePWAContext} from '../PWAContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    ChartTooltip,
    Legend,
    Filler,
);

const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

const ProfilePage = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activity, setActivity] = useState<number[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [editOpen, setEditOpen] = useState(false);
    const [editData, setEditData] = useState({username: '', email: ''});
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [monthFrom, setMonthFrom] = useState<number>(0);
    const [monthTo, setMonthTo] = useState<number>(11);
    const [yearsAvailable, setYearsAvailable] = useState<number[]>([]);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({currentPassword: '', newPassword: ''});
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [pwaStatus, promptInstall] = usePWAContext();
    const theme = useTheme();
    const chartRef = useRef<any>(null);

    // Load user and activity
    useEffect(() => {
        const loadData = async () => {
            try {
                const userRes = await getUserInfo();
                setEditData({
                    username: userRes.data?.username || '',
                    email: userRes.data?.email || ''
                });
                setUser(userRes.data || userRes);

                const transRes = await fetchAllTransactions();
                const txs = transRes.data || transRes;
                setTransactions(txs);

                // Wyznacz dostępne lata z transakcji
                const years = Array.from(new Set(txs.map((t: any) => new Date(t.date).getFullYear())));
                years.sort((a, b) => b - a);
                setYearsAvailable(years.length ? years : [new Date().getFullYear()]);
                setYear(years.length ? years[0] : new Date().getFullYear());
            } catch (error) {
                console.error("Błąd podczas ładowania danych:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        if (chartRef.current) {
            const chart = chartRef.current;

            // Tworzenie nowych opcji zamiast modyfikowania istniejących
            const newOptions = {...chart.options};

            if (newOptions.scales?.y) {
                if (!newOptions.scales.y.grid) newOptions.scales.y.grid = {};
                newOptions.scales.y.grid.color = alpha(theme.palette.divider, 0.5);

                // Bezpieczna aktualizacja wykresu
                chart.options = newOptions;

                try {
                    chart.update('none'); // Tryb 'none' zapobiega animacji podczas aktualizacji
                } catch (err) {
                    console.error('Błąd aktualizacji wykresu:', err);
                }
            }
        }
    }, [theme]);

    // Przelicz aktywność po zmianie zakresu
    useEffect(() => {
        const counts = [];
        for (let m = monthFrom; m <= monthTo; m++) {
            counts.push(
                transactions.filter((t: any) => {
                    const d = new Date(t.date);
                    return d.getFullYear() === year && d.getMonth() === m;
                }).length
            );
        }
        setActivity(counts);
    }, [transactions, year, monthFrom, monthTo]);

    const handleInstallClick = async () => {
        if (pwaStatus.isInstalled && !pwaStatus.isStandalone) {
            window.open(window.location.origin + window.location.pathname, '_blank');
            return;
        }
        await promptInstall();
    };

    // Obsługa edycji profilu
    const handleEditOpen = () => {
        setEditData({username: user?.username || '', email: user?.email || ''});
        setEditError('');
        setEditOpen(true);
    };

    const handleEditSave = async () => {
        setEditLoading(true);
        setEditError('');
        try {
            await updateUserProfile(editData);
            setUser((prev: any) => ({...prev, ...editData}));
            setEditOpen(false);
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.msg ||
                e?.response?.data?.errors?.[0]?.msg ||
                'Błąd aktualizacji profilu';
            setEditError(msg);
        }
        setEditLoading(false);
    };

    // Obsługa zmiany hasła
    const handlePasswordOpen = () => {
        setPasswordData({currentPassword: '', newPassword: ''});
        setPasswordError('');
        setPasswordSuccess('');
        setPasswordOpen(true);
    };

    const handlePasswordSave = async () => {
        setPasswordLoading(true);
        setPasswordError('');
        setPasswordSuccess('');
        try {
            await changePassword(passwordData);
            setPasswordSuccess('Hasło zostało zmienione');
            setTimeout(() => setPasswordOpen(false), 1200);
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.msg ||
                e?.response?.data?.errors?.[0]?.msg ||
                'Błąd zmiany hasła';
            setPasswordError(msg);
        }
        setPasswordLoading(false);
    };

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <CircularProgress/>
            </Box>
        );
    }

    // Etykiety miesięcy do wykresu
    const labels = [];
    for (let m = monthFrom; m <= monthTo; m++) {
        labels.push(monthNames[m]);
    }

    const monthlyExpenses = [];
    for (let m = monthFrom; m <= monthTo; m++) {
        const total = transactions
            .filter((t: any) => {
                const d = new Date(t.date);
                return d.getFullYear() === year && d.getMonth() === m && t.type === 'expense';
            })
            .reduce((sum, t) => sum + t.amount, 0);
        monthlyExpenses.push(total);
    }

    const activityData = {
        labels,
        datasets: [
            {
                label: 'Liczba transakcji',
                data: activity,
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: theme.palette.primary.light,
                borderWidth: 2,
            },
            {
                label: 'Suma wydatków',
                data: monthlyExpenses,
                borderColor: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.12),
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: theme.palette.error.light,
                borderWidth: 2,
            },
        ],
    };
    const options: ChartOptions<'line'> = {
        responsive: true,
        animation: {
            duration: 1500,
            // Używamy tylko dozwolonych wartości dla easing
            easing: 'easeOutQuart',
            // Usuwamy problematyczny delay
        }
    }


    return (
        <Box sx={{py: 4, px: {xs: 2, md: 4}}}>
            <Grid container spacing={3}>
                {/* Główna karta profilu */}
                <Grid size={{xs: 12, md: 4}}>
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 3,
                            height: '100%',
                            transition: 'all 0.3s',
                            '&:hover': {transform: 'translateY(-5px)'}
                        }}
                    >
                        <CardContent sx={{p: 3, textAlign: 'center'}}>
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
                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            <Typography variant="h5" gutterBottom>
                                {user?.username || 'Użytkownik'}
                            </Typography>
                            <Typography color="text.secondary" gutterBottom>
                                {user?.email || 'email@przykład.com'}
                            </Typography>

                            <Box sx={{mt: 2}}>
                                <Chip
                                    label="Aktywny użytkownik"
                                    color="success"
                                    sx={{fontWeight: 'medium'}}
                                />
                            </Box>

                            <Divider sx={{my: 3}}/>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<EditIcon/>}
                                    sx={{borderRadius: 2}}
                                    onClick={handleEditOpen}
                                >
                                    Edytuj profil
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<LockIcon/>}
                                    sx={{borderRadius: 2}}
                                    onClick={handlePasswordOpen}
                                >
                                    Zmień hasło
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Aktywność użytkownika - cała szerokość */}
                <Grid size={{xs: 12, md: 8}}>
                    <Card
                        elevation={3}
                        sx={{
                            borderRadius: 3,
                            minHeight: 420,
                            transition: 'all 0.3s',
                            '&:hover': {transform: 'translateY(-5px)'}
                        }}
                    >
                        <CardContent>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2}}>
                                <Typography variant="h6" sx={{flexGrow: 1}}>
                                    Twoja aktywność
                                </Typography>
                                <FormControl size="small" sx={{minWidth: 100}}>
                                    <InputLabel>Rok</InputLabel>
                                    <Select
                                        value={year}
                                        label="Rok"
                                        onChange={e => setYear(Number(e.target.value))}
                                    >
                                        {yearsAvailable.map(y => (
                                            <MenuItem key={y} value={y}>{y}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={{minWidth: 120}}>
                                    <InputLabel>Miesiąc od</InputLabel>
                                    <Select
                                        value={monthFrom}
                                        label="Miesiąc od"
                                        onChange={e => setMonthFrom(Number(e.target.value))}
                                    >
                                        {monthNames.map((m, idx) => (
                                            <MenuItem key={m} value={idx} disabled={idx > monthTo}>{m}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={{minWidth: 120}}>
                                    <InputLabel>Miesiąc do</InputLabel>
                                    <Select
                                        value={monthTo}
                                        label="Miesiąc do"
                                        onChange={e => setMonthTo(Number(e.target.value))}
                                    >
                                        {monthNames.map((m, idx) => (
                                            <MenuItem key={m} value={idx} disabled={idx < monthFrom}>{m}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{height: 350, mt: 2}}>
                                <Line
                                    key={`chart-${theme.palette.mode}`}
                                    data={activityData}
                                    options={options}
                                    ref={chartRef}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Ustawienia aplikacji na dole */}
            <Box sx={{mt: 4, maxWidth: 400, mx: 'auto'}}>
                <Card elevation={3} sx={{
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    '&:hover': {transform: 'translateY(-3px)', boxShadow: 6}
                }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Ustawienia aplikacji
                        </Typography>
                        {pwaStatus.isInstalled && !pwaStatus.isStandalone && (
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                startIcon={<DownloadIcon/>}
                                sx={{borderRadius: 2, py: 1.5, mt: 1}}
                                onClick={handleInstallClick}
                            >
                                Otwórz aplikację (PWA)
                            </Button>
                        )}
                        {!pwaStatus.isStandalone && pwaStatus.isAvailable && (
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                startIcon={<DownloadIcon/>}
                                sx={{
                                    borderRadius: 2,
                                    py: 1.5,
                                    mt: 1,
                                    position: 'relative',
                                    overflow: 'visible',
                                    boxShadow: 3,
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        inset: -3,
                                        borderRadius: 'inherit',
                                        border: `2px solid ${theme.palette.primary.main}`,
                                        opacity: 0.6,
                                        animation: 'pulsate 1.5s ease-out infinite'
                                    },
                                    '@keyframes pulsate': {
                                        '0%': {transform: 'scale(1)', opacity: 0.6},
                                        '50%': {transform: 'scale(1.05)', opacity: 0.3},
                                        '100%': {transform: 'scale(1)', opacity: 0.6}
                                    }
                                }}
                                onClick={handleInstallClick}
                            >
                                Zainstaluj aplikację (PWA)
                            </Button>
                        )}
                        {pwaStatus.isStandalone && (
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<DownloadIcon/>}
                                sx={{borderRadius: 2, py: 1.5, mt: 1}}
                                disabled
                            >
                                Aplikacja już otwarta przez PWA
                            </Button>
                        )}
                        {!pwaStatus.isAvailable && !pwaStatus.isInstalled && !pwaStatus.isStandalone && (
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<DownloadIcon/>}
                                sx={{borderRadius: 2, py: 1.5, mt: 1}}
                                disabled
                            >
                                Instalacja niedostępna w tej przeglądarce
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Modal edycji profilu */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Edytuj profil</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Nazwa użytkownika"
                        fullWidth
                        margin="normal"
                        value={editData.username}
                        onChange={e => setEditData(d => ({...d, username: e.target.value}))}
                    />
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        value={editData.email}
                        onChange={e => setEditData(d => ({...d, email: e.target.value}))}
                    />
                    {editError && (
                        <Typography color="error" variant="body2" sx={{mt: 1}}>
                            {editError}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Anuluj</Button>
                    <Button
                        onClick={handleEditSave}
                        variant="contained"
                        disabled={editLoading}
                    >
                        Zapisz
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal zmiany hasła */}
            <Dialog open={passwordOpen} onClose={() => setPasswordOpen(false)}>
                <DialogTitle>Zmień hasło</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Obecne hasło"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData(d => ({...d, currentPassword: e.target.value}))}
                    />
                    <TextField
                        label="Nowe hasło"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData(d => ({...d, newPassword: e.target.value}))}
                    />
                    {passwordError && (
                        <Typography color="error" variant="body2" sx={{mt: 1}}>
                            {passwordError}
                        </Typography>
                    )}
                    {passwordSuccess && (
                        <Typography color="success.main" variant="body2" sx={{mt: 1}}>
                            {passwordSuccess}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordOpen(false)}>Anuluj</Button>
                    <Button
                        onClick={handlePasswordSave}
                        variant="contained"
                        disabled={passwordLoading}
                    >
                        Zmień hasło
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfilePage;