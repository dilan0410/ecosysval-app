// SENTRY: debe ir ANTES de cualquier otro import
// Import explícito para evitar tree-shaking en producción
import './instrument';
import * as Sentry from '@sentry/nestjs';

// WINSTON: Logger
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

const compression = require('compression');

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // NUEVO
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // WINSTON: Usar Winston como logger principal
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // HELMET
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // COMPRESSION: Comprime respuestas (gzip)
  app.use(compression({
    threshold: 1024, // Solo comprime si es mayor a 1KB
    level: 6,        // Balance entre velocidad y compresión (0-9)
  }));

  // Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // NUEVO: Registrar Exception Filter Global
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'https://ecosysval-app.vercel.app',
      /\.vercel\.app$/,
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Archivos estáticos
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // ============================================
  // SWAGGER: Documentación automática de la API
  // ============================================
  const config = new DocumentBuilder()
    .setTitle('Ecosysval API')
    .setDescription(
      'API del ecosistema empresarial Ecosysval. ' +
      'Gestión de empresas, usuarios, publicaciones, ofertas de empleo y más.',
    )
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y registro')
    .addTag('users', 'Gestión de usuarios')
    .addTag('empresas', 'Gestión de empresas')
    .addTag('posts', 'Publicaciones')
    .addTag('empleo', 'Ofertas de empleo')
    .addTag('contact', 'Formularios de contacto')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresa tu token JWT (obtenido en /auth/login)',
        in: 'header',
      },
      'JWT-auth', // Nombre de referencia para usar en decoradores
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Recuerda el token entre recargas
    },
    customSiteTitle: 'Ecosysval API Docs',
  });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, '0.0.0.0');

  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación API: http://localhost:${PORT}/api`);
  console.log(`🖼️  Archivos en http://localhost:${PORT}/uploads`);
}

bootstrap();