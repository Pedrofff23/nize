import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Register service worker for PWA support
registerSW({
    onRegisteredSW(swUrl, registration) {
        if (registration) {
            // Check for updates every hour
            setInterval(() => {
                registration.update();
            }, 60 * 60 * 1000);
        }
    },
    onOfflineReady() {
        console.log("App ready to work offline");
    },
});

createRoot(document.getElementById("root")!).render(<App />);
