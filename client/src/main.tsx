import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as serviceWorker from './serviceWorker';

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

if ('serviceWorker' in navigator) {
    try {
        serviceWorker.register({
            onSuccess: (registration) => {
                console.log('Service Worker zarejestrowany pomyślnie', registration);
            },
            onUpdate: (registration) => {
                console.log('Service Worker zaktualizowany', registration);
                // Automatyczne przeładowanie po aktualizacji SW
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                        window.location.reload();
                    });
                }
            }
        });
    } catch (err: any) {
        console.error('Błąd rejestracji Service Workera:', err);
    }
}