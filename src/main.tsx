import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

// Bootstrap the CSR application.
// We call getRouter() to create a fresh router instance, then render it.
const router = getRouter();

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root element not found — check index.html");
}

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
