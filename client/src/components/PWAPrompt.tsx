import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Typography, useTheme
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import { usePWAContext } from '../PWAContext';

const PWAPrompt: React.FC = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showOpenPrompt, setShowOpenPrompt] = useState(false);
  const theme = useTheme();
  const [pwaStatus, promptInstall] = usePWAContext();

  useEffect(() => {
    if (pwaStatus.isStandalone) return; // Nie pokazuj dialogów jeśli już uruchomiona jako PWA

    const pwaPromptShown = localStorage.getItem('pwaPromptShown');
    if (pwaPromptShown === 'true') return;

    // Jeśli aplikacja jest zainstalowana, ale nie jest uruchomiona w trybie standalone
    if (pwaStatus.isInstalled && !pwaStatus.isStandalone) {
      setShowOpenPrompt(true);
    }
    // Jeśli aplikacja jest dostępna do instalacji
    else if (pwaStatus.isAvailable) {
      setShowInstallPrompt(true);
    }
  }, [pwaStatus]);

  const handleClose = () => {
    setShowInstallPrompt(false);
    setShowOpenPrompt(false);
    localStorage.setItem('pwaPromptShown', 'true');
  };

  const handleInstall = async () => {
    await promptInstall();
    setShowInstallPrompt(false);
  };

  const handleOpenPWA = () => {
    window.open(window.location.origin + window.location.pathname, '_blank');
    setShowOpenPrompt(false);
  };

  const logoPath = `${import.meta.env.BASE_URL}logo192.png`;

  return (
      <>
        {/* Dialog instalacji */}
        <Dialog open={showInstallPrompt} onClose={handleClose} PaperProps={{ sx: { borderRadius: 3, maxWidth: 400 } }}>
          <DialogTitle>
            Zainstaluj aplikację
            <Button sx={{ position: 'absolute', right: 8, top: 8 }} onClick={handleClose}>
              <CloseIcon />
            </Button>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <img
                  src={logoPath}
                  alt="Logo aplikacji"
                  style={{ width: 100, height: 100, marginBottom: 16 }}
              />
              <Typography variant="body1" gutterBottom>
                Zainstaluj naszą aplikację na swoim urządzeniu, aby korzystać z niej offline i uzyskać lepsze wrażenia z użytkowania.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
            <Button onClick={handleClose} color="inherit">
              Później
            </Button>
            <Button
                onClick={handleInstall}
                variant="contained"
                startIcon={<GetAppIcon />}
                sx={{
                  ml: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                }}
                disabled={!pwaStatus.installPrompt}
            >
              Zainstaluj teraz
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog otwarcia zainstalowanej aplikacji */}
        <Dialog open={showOpenPrompt} onClose={handleClose} PaperProps={{ sx: { borderRadius: 3, maxWidth: 400 } }}>
          <DialogTitle>
            Otwórz aplikację
            <Button sx={{ position: 'absolute', right: 8, top: 8 }} onClick={handleClose}>
              <CloseIcon />
            </Button>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <img
                  src={logoPath}
                  alt="Logo aplikacji"
                  style={{ width: 100, height: 100, marginBottom: 16 }}
              />
              <Typography variant="body1" gutterBottom>
                Wygląda na to, że aplikacja jest już zainstalowana na Twoim urządzeniu.
                <br />
                Czy chcesz ją otworzyć?
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
            <Button onClick={handleClose} color="inherit">
              Zamknij
            </Button>
            <Button
                onClick={handleOpenPWA}
                variant="contained"
                startIcon={<OpenInNewIcon />}
                sx={{
                  ml: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                }}
            >
              Otwórz aplikację
            </Button>
          </DialogActions>
        </Dialog>
      </>
  );
};

export default PWAPrompt;