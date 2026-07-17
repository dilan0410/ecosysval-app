// backend/src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
// SENTRY
import * as Sentry from '@sentry/nestjs';

/**
 * Exception Filter Global
 * 
 * Captura TODOS los errores de la aplicación y los devuelve con un formato
 * consistente y profesional.
 * 
 * Formato de respuesta:
 * {
 *   success: false,
 *   statusCode: 400,
 *   message: "Mensaje principal del error",
 *   errors: ["array de errores si hay múltiples"],
 *   path: "/ruta/donde/fallo",
 *   timestamp: "2026-07-13T18:30:45.123Z"
 * }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Detectar el status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Obtener el mensaje del error
    let message = 'Error interno del servidor';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const errObj = exceptionResponse as any;

        // Si el message es un array (típico de class-validator)
        if (Array.isArray(errObj.message)) {
          errors = errObj.message;
          message = errObj.message[0]; // El primer error como mensaje principal
        } else {
          message = errObj.message || message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log del error (para debugging)
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Message: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

        // SENTRY: solo reportar errores 500+ (ignorar 400s que son del usuario)
    if (status >= 500 && exception instanceof Error) {
      Sentry.captureException(exception, {
        tags: {
          method: request.method,
          path: request.url,
        },
        extra: {
          statusCode: status,
        },
      });
    }

    // Respuesta unificada
    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      errors: errors.length > 0 ? errors : undefined,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}