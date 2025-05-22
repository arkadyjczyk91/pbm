// Service Worker dla PWA (Vite + GitHub Pages)

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config) {
  // Użyj import.meta.env.PROD i import.meta.env.BASE_URL zamiast process.env
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    // Vite automatycznie ustawia import.meta.env.BASE_URL na base z vite.config.ts
    const base = import.meta.env.BASE_URL || '/';
    window.addEventListener('load', () => {
      const swUrl = `${base}service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('Ta aplikacja jest serwowana z cache przez service worker.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('Nowa zawartość jest dostępna i zostanie użyta po odświeżeniu.');
                if (config && config.onUpdate) {
                  config.onUpdate(registration);
                }
              } else {
                console.log('Zawartość jest zapisana w cache do użycia offline.');
                if (config && config.onSuccess) {
                  config.onSuccess(registration);
                }
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('Błąd podczas rejestracji service workera:', error);
      });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
      .then((response) => {
        const contentType = response.headers.get('content-type');
        if (
            response.status === 404 ||
            (contentType != null && contentType.indexOf('javascript') === -1)
        ) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.unregister().then(() => {
              window.location.reload();
            });
          });
        } else {
          registerValidSW(swUrl, config);
        }
      })
      .catch(() => {
        console.log('Brak połączenia z internetem. Aplikacja działa w trybie offline.');
      });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
        .then((registration) => {
          registration.unregister();
        })
        .catch((error) => {
          console.error(error.message);
        });
  }
}