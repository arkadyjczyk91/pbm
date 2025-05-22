import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as serviceWorker from './serviceWorker';

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// Zawsze rejestruj service worker, niezależnie od środowiska
if ('serviceWorker' in navigator) {
    serviceWorker.register({
        onSuccess: (registration) => {
            console.log('Service Worker zarejestrowany pomyślnie', registration);
        },
        onUpdate: (registration) => {
            console.log('Service Worker zaktualizowany', registration);
        }
    });
}