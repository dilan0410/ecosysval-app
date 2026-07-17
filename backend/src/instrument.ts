// backend/src/instrument.ts
/**
 * Inicialización de Sentry.
 * DEBE importarse ANTES que cualquier otra cosa en main.ts
 */

// Cargar .env manualmente ANTES de leer las variables
// (porque @nestjs/config aún no se ha inicializado en este punto)
import * as dotenv from 'dotenv';
dotenv.config();

import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Solo inicializar Sentry si hay DSN configurado
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Captura performance del 10% de las requests (bajo costo)
    tracesSampleRate: 0.1,
    // Perfila el 10% de las requests
    profilesSampleRate: 0.1,
  });

  console.log(' Sentry inicializado (backend)');
} else {
  console.log('  SENTRY_DSN no configurado — Sentry deshabilitado');
}