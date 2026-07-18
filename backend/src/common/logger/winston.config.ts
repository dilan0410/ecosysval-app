// backend/src/common/logger/winston.config.ts
/**
 * Configuración de Winston para logs.
 * 
 * Comportamiento:
 * - DESARROLLO: Logs coloreados en consola (fácil de leer)
 * - PRODUCCIÓN: Logs en formato JSON + archivos rotativos
 * 
 * Archivos generados en /logs:
 * - app-YYYY-MM-DD.log      → TODOS los logs (info, warn, error)
 * - error-YYYY-MM-DD.log    → SOLO errores (para debug rápido)
 * 
 * Rotación diaria: archivo nuevo cada día, elimina >14 días.
 */

import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const isProduction = process.env.NODE_ENV === 'production';

// ==========================================
// FORMATO PARA DESARROLLO (colorido + legible)
// ==========================================
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike('Ecosysval', {
    prettyPrint: true,
    colors: true,
  }),
);

// ==========================================
// FORMATO PARA PRODUCCIÓN (JSON estructurado)
// ==========================================
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// ==========================================
// TRANSPORTES (destinos de los logs)
// ==========================================
const transports: winston.transport[] = [
  // Siempre a consola
  new winston.transports.Console({
    format: isProduction ? productionFormat : developmentFormat,
  }),
];

// Solo en desarrollo/local: también a archivos
// (En producción Render captura los logs de consola)
if (!isProduction) {
  transports.push(
    // Archivo con TODOS los logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // Guardar máximo 14 días
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    // Archivo SOLO con errores
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error', // Solo errores
      maxSize: '20m',
      maxFiles: '30d', // Guardar errores 30 días
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  );
}

// ==========================================
// CONFIGURACIÓN FINAL EXPORTADA
// ==========================================
export const winstonConfig: winston.LoggerOptions = {
  level: isProduction ? 'info' : 'debug', // Prod: info+; Dev: todo
  transports,
  // Manejo de excepciones no capturadas
  exceptionHandlers: [
    new winston.transports.Console({
      format: isProduction ? productionFormat : developmentFormat,
    }),
  ],
  // Manejo de promesas rechazadas no capturadas
  rejectionHandlers: [
    new winston.transports.Console({
      format: isProduction ? productionFormat : developmentFormat,
    }),
  ],
};