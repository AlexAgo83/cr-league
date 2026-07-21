import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App.js";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/600-italic.css";
import "@fontsource/barlow-condensed/800-italic.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/championship.css";
import "./styles/garage.css";
import "./styles/replay-report.css";
import "./styles/responsive.css";
import "./styles/pit-wall.css";
import "./styles/paper-material.css";
import "./styles/directive-telemetry.css";
import "./styles/plan-steps.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
