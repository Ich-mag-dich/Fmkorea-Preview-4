import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./style.css";
import { followSystemTheme } from "@/lib/system-theme";

followSystemTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
