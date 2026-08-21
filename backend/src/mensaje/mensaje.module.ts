// backend/src/mensaje/mensaje.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Conversacion } from './conversacion.entity';
import { Mensaje } from './mensaje.entity';
import { User } from '../user/user.entity';
import { MensajeService } from './mensaje.service';
import { MensajeController } from './mensaje.controller';
import { MensajeGateway } from './mensaje.gateway';
import { NotificacionModule } from '../notificacion/notificacion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversacion, Mensaje, User]),
    NotificacionModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'secretKey123',
      }),
    }),
  ],
  controllers: [MensajeController],
  providers: [MensajeService, MensajeGateway],
  exports: [MensajeService, MensajeGateway],
})
export class MensajeModule {}