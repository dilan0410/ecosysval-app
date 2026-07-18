// backend/src/common/logger/logger.module.ts
/**
 * MÓDULO GLOBAL DE LOGGING
 * -------------------------------------------------------
 * Expone AppLoggerService a TODA la aplicación.
 *
 * Al ser @Global(), no hace falta importar LoggerModule
 * en cada módulo que use el logger. Basta con inyectar
 * AppLoggerService en el constructor.
 */

import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AppLoggerService } from './logger.service';
import { winstonConfig } from './winston.config';

@Global()
@Module({
  imports: [
    // Registrar Winston para que nest-pinston lo inyecte
    WinstonModule.forRoot(winstonConfig),
  ],
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggerModule {}