// backend/src/common/middleware/request-logger.middleware.ts
import { Injectable, NestMiddleware, Logger, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Se ejecuta cuando la respuesta termina
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const contentLength = res.get('content-length') || 0;

      // Emoji según el status code
      let emoji = '✅';
      let level = 'info';

      if (statusCode >= 500) {
        emoji = '🔴';
        level = 'error';
      } else if (statusCode >= 400) {
        emoji = '🟡';
        level = 'warn';
      } else if (statusCode >= 300) {
        emoji = '🔵';
      }

      const message = `${emoji} ${method} ${originalUrl} ${statusCode} - ${duration}ms - ${contentLength} bytes`;

      // Log estructurado con metadata
      const metadata = {
        type: 'http',
        method,
        url: originalUrl,
        statusCode,
        duration,
        contentLength: parseInt(contentLength as string) || 0,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      };

      // Loguear según el nivel
      if (level === 'error') {
        this.logger.error(message, metadata);
      } else if (level === 'warn') {
        this.logger.warn(message, metadata);
      } else {
        this.logger.info(message, metadata);
      }
    });

    next();
  }
}