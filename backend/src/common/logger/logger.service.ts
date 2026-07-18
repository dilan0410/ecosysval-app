// backend/src/common/logger/logger.service.ts
/**
 * SERVICIO CENTRALIZADO DE LOGS
 * -------------------------------------------------------
 * Wrapper sobre Winston con métodos específicos para eventos
 * comunes de Ecosysval.
 *
 * Ventajas:
 * - Logs consistentes en toda la app
 * - Metadata estructurada (para búsquedas después)
 * - Fácil de usar: logger.userCreated(...)
 *
 * Categorías:
 * - Usuarios (registro, login, logout)
 * - Seguridad (login fallido, rate limit, etc.)
 * - Negocio (empresas, empleos, pagos)
 * - Sistema (arranque, errores, warnings)
 */

import { Injectable, LoggerService as NestLoggerService, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';

@Injectable()
export class AppLoggerService implements NestLoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  // ==========================================
  // MÉTODOS BÁSICOS (compatibles con NestJS Logger)
  // ==========================================

  log(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: Record<string, any>) {
    this.logger.error(message, { context, trace, ...meta });
  }

  warn(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.verbose(message, { context, ...meta });
  }

  // ==========================================
  // USUARIOS (eventos de auth y registro)
  // ==========================================

  userRegistered(userId: number, email: string) {
    this.logger.info('Usuario registrado', {
      category: 'USER',
      event: 'user_registered',
      userId,
      email,
    });
  }

  userLoginSuccess(userId: number, email: string, ip?: string) {
    this.logger.info('Login exitoso', {
      category: 'USER',
      event: 'login_success',
      userId,
      email,
      ip,
    });
  }

  userLoginFailed(email: string, reason: string, ip?: string) {
    this.logger.warn('Login fallido', {
      category: 'SECURITY',
      event: 'login_failed',
      email,
      reason,
      ip,
    });
  }

  userEmailVerified(userId: number, email: string) {
    this.logger.info('Email verificado', {
      category: 'USER',
      event: 'email_verified',
      userId,
      email,
    });
  }

  userPasswordReset(userId: number, email: string) {
    this.logger.info('Contraseña restablecida', {
      category: 'USER',
      event: 'password_reset',
      userId,
      email,
    });
  }

  userPasswordResetRequested(email: string) {
    this.logger.info('Solicitud de recuperación de contraseña', {
      category: 'USER',
      event: 'password_reset_requested',
      email,
    });
  }

  // ==========================================
  // SEGURIDAD (eventos sospechosos)
  // ==========================================

  securityAlert(message: string, meta: Record<string, any>) {
    this.logger.warn(message, {
      category: 'SECURITY',
      event: 'security_alert',
      ...meta,
    });
  }

  rateLimitHit(endpoint: string, ip?: string) {
    this.logger.warn('Rate limit alcanzado', {
      category: 'SECURITY',
      event: 'rate_limit',
      endpoint,
      ip,
    });
  }

  unauthorizedAccess(endpoint: string, ip?: string, userId?: number) {
    this.logger.warn('Acceso no autorizado', {
      category: 'SECURITY',
      event: 'unauthorized_access',
      endpoint,
      ip,
      userId,
    });
  }

  // ==========================================
  // EMAILS (envíos y errores)
  // ==========================================

  emailSent(type: string, to: string, messageId?: string) {
    this.logger.info('Email enviado', {
      category: 'EMAIL',
      event: 'email_sent',
      type,
      to,
      messageId,
    });
  }

  emailFailed(type: string, to: string, error: string) {
    this.logger.error('Fallo al enviar email', {
      category: 'EMAIL',
      event: 'email_failed',
      type,
      to,
      error,
    });
  }

  // ==========================================
  // NEGOCIO (empresas, empleos, etc.)
  // ==========================================

  empresaCreated(empresaId: number, userId: number, nombre: string) {
    this.logger.info('Empresa creada', {
      category: 'BUSINESS',
      event: 'empresa_created',
      empresaId,
      userId,
      nombre,
    });
  }

  empleoCreated(empleoId: number, empresaId: number, titulo: string) {
    this.logger.info('Empleo creado', {
      category: 'BUSINESS',
      event: 'empleo_created',
      empleoId,
      empresaId,
      titulo,
    });
  }

  // ==========================================
  // SISTEMA (arranque, config, etc.)
  // ==========================================

  systemStartup(port: number, environment: string) {
    this.logger.info('Sistema iniciado', {
      category: 'SYSTEM',
      event: 'startup',
      port,
      environment,
    });
  }

  systemShutdown(reason?: string) {
    this.logger.info('Sistema apagándose', {
      category: 'SYSTEM',
      event: 'shutdown',
      reason,
    });
  }
}