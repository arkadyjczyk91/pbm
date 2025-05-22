import { useState, useEffect } from 'react';

interface PWAStatus {
  isAvailable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  installPrompt: any;
}

export function usePWA(): [PWAStatus, () => Promise<void>] {
  const [status, setStatus] = useState<PWAStatus>({
    isAvailable: false,
    isInstalled: false,
    isStandalone: false,
    installPrompt: null
  });

  useEffect(() => {
    // Sprawdzanie, czy aplikacja działa w trybie standalone
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as any).standalone === true;

      setStatus(prev => ({ ...prev, isStandalone, isInstalled: isStandalone }));
    };

    // Przechwytywanie zdarzenia beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setStatus(prev => ({ ...prev, isAvailable: true, installPrompt: e }));
    };

    // Sprawdzanie, czy aplikacja została zainstalowana
    const handleAppInstalled = () => {
      setStatus(prev => ({ ...prev, isInstalled: true }));
    };

    // Obsługa zmiany trybu wyświetlania
    const handleDisplayModeChange = () => {
      checkStandalone();
    };

    // Inicjalizacja
    checkStandalone();

    // Dodanie nasłuchiwania zdarzeń
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleDisplayModeChange);
    window.addEventListener('resize', checkStandalone);

    // Usunięcie nasłuchiwania zdarzeń
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleDisplayModeChange);
      window.removeEventListener('resize', checkStandalone);
    };
  }, []);

  // Funkcja do uruchomienia instalacji
  const promptInstall = async () => {
    const { installPrompt } = status;
    if (!installPrompt) return;

    // Pokazanie monitu instalacji
    installPrompt.prompt();

    // Oczekiwanie na wybór użytkownika
    const { outcome } = await installPrompt.userChoice;

    // Aktualizacja statusu na podstawie wyboru
    if (outcome === 'accepted') {
      setStatus(prev => ({ ...prev, isInstalled: true, installPrompt: null }));
    }
  };

  return [status, promptInstall];
}