import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// -------------------------------------------------------------------
// Entry point
// Mounts the React tree into the #root div in index.html.
// StrictMode is kept on during development to catch common issues.
// -------------------------------------------------------------------

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);
