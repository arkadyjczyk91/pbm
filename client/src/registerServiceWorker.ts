// Plik rejestrujący Service Workera (importuj w main.tsx)
export function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/service-worker.js").catch((err) => {
                console.error("SW registration failed: ", err);
            });
        });
    }
}