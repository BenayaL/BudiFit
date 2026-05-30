// app = application entry and routing
// main.tsx is the single entry point that mounts the React tree into the DOM.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// CSS is one level up (src/styles/) relative to this file (src/app/)
import "../styles/index.css";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
