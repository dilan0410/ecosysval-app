import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // NUEVO
import { APP_GUARD } from '@nestjs/core'; // NUEVO
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { User } from './user/user.entity';
import { Post } from './post/post.entity';
import { EmpresaModule } from './empresa/empresa.module';
import { ContactModule } from './contact/contact.module';
import { EmpleoModule } from './empleo/empleo.module';
import { StorageModule } from './common/storage/storage.module';
import { NotificacionModule } from './notificacion/notificacion.module';

// WINSTON: Logger global
import { LoggerModule } from './common/logger/logger.module';

// ANALYTICS
import { AdminModule } from './admin/admin.module';

import { ResenaModule } from './resena/resena.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // WINSTON: Logger global
    LoggerModule,

    // NUEVO: Rate Limiting Global
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 segundo
        limit: 3, // 3 peticiones por segundo
      },
      {
        name: 'medium',
        ttl: 10000, // 10 segundos
        limit: 20, // 20 peticiones por 10 segundos
      },
      {
        name: 'long',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 peticiones por minuto
      },
    ]),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        if (process.env.NODE_ENV === 'test') {
          return {
            type: 'sqlite',
            database: ':memory:',
            dropSchema: true,
            autoLoadEntities: true,
            synchronize: true,
            entities: [User, Post],
          };
        }

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: parseInt(config.get<string>('DB_PORT') ?? '5432', 10),
          username: config.get<string>('DB_USERNAME'),
          password: String(config.get<string>('DB_PASSWORD')),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
          entities: [User, Post],
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),

    UserModule,
    AuthModule,
    PostModule,
    EmpresaModule,
    ContactModule,
    EmpleoModule,
    StorageModule,
    AdminModule, // analytics
    ResenaModule, // reseñas
    NotificacionModule, // notificaciones
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // NUEVO: Aplicar ThrottlerGuard globalmente
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes('*'); // Aplica a TODAS las rutas
  }
}