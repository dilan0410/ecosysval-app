import React from "react";
import ReactDOM from "react-dom/client";

import "./i18n";

// SENTRY: debe ir ANTES de App
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";

import "./styles/theme.css";
import "./index.css";

import { ThemeProvider } from "./components/ThemeProvider";

// SENTRY: Inicialización (solo si hay DSN)
if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true, // Enmascara textos por privacidad
        blockAllMedia: true, // No graba imágenes/videos
      }),
    ],
    tracesSampleRate: 0.1, // 10% de sesiones para performance
    replaysSessionSampleRate: 0.0, // No grabar sesiones normales
    replaysOnErrorSampleRate: 1.0, // Grabar SOLO sesiones con error
  });

}

// React Query - para caché global

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 min: datos “frescos” sin refetch
      gcTime: 1000 * 60 * 30,        // 30 min en memoria (antes cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,   // no spamear al cambiar de pestaña
      refetchOnReconnect: true,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);