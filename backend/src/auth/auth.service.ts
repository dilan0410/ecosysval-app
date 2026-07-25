// backend/src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
// WINSTON
import { AppLoggerService } from '../common/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, 
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // WINSTON
    private readonly logger: AppLoggerService,
  ) {}

  // ==========================================
  // VALIDAR USUARIO (login)
  // ==========================================
  async validateUser(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      this.logger.userLoginFailed(email, 'user_not_found');
      return null;
    }

    const passwordValido = await bcrypt.compare(pass, user.password);
    if (!passwordValido) {
      this.logger.userLoginFailed(email, 'invalid_password');
      return null;
    }

    if (!user.email_verified) {
      this.logger.userLoginFailed(email, 'email_not_verified');
      throw new UnauthorizedException(
        'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.',
      );
    }

    const { password, verification_token, refresh_token, ...result } = user;
    return result;
  }

  // ==========================================
  // LOGIN: genera access_token + refresh_token
  // ==========================================
  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Generar ambos tokens
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken();

    // Guardar refresh_token en la BD (30 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.userRepository.update(user.id, {
      refresh_token: refreshToken,
      refresh_token_expires: expiresAt,
    });

    // WINSTON: Login exitoso
    this.logger.userLoginSuccess(user.id, user.email);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }

  // ==========================================
  // REFRESH: genera nuevo access_token
  // ==========================================
  async refreshTokens(refreshToken: string) {
    // Buscar usuario por refresh_token
    const user = await this.userRepository.findOne({
      where: { refresh_token: refreshToken },
    });

    if (!user) {
      this.logger.securityAlert('Intento de refresh con token inválido', {
        event: 'refresh_invalid_token',
        token: refreshToken?.substring(0, 8) + '...',
      });
      throw new UnauthorizedException('Token de refresh inválido');
    }

    // Verificar que no haya expirado
    if (
      !user.refresh_token_expires ||
      user.refresh_token_expires < new Date()
    ) {
      this.logger.warn(
        'Intento de refresh con token expirado',
        'AuthService',
        {
          event: 'refresh_expired_token',
          userId: user.id,
        },
      );
      // Limpiar el token expirado
      await this.userRepository.update(user.id, {
        refresh_token: null,
        refresh_token_expires: null,
      });
      throw new UnauthorizedException(
        'La sesión ha expirado. Por favor inicia sesión de nuevo.',
      );
    }

    // Generar nuevo access_token
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const newAccessToken = this.generateAccessToken(payload);

    // Log de refresh exitoso
    this.logger.log('Token refrescado', 'AuthService', {
      category: 'USER',
      event: 'token_refreshed',
      userId: user.id,
      email: user.email,
    });

    return {
      access_token: newAccessToken,
    };
  }

  // ==========================================
  // LOGOUT: invalida el refresh_token
  // ==========================================
  async logout(userId: number) {
    await this.userRepository.update(userId, {
      refresh_token: null,
      refresh_token_expires: null,
    });

    this.logger.log('Logout exitoso', 'AuthService', {
      category: 'USER',
      event: 'logout',
      userId,
    });

    return {
      success: true,
      message: 'Sesión cerrada correctamente',
    };
  }

  // ==========================================
  // HELPERS PRIVADOS
  // ==========================================

  /**
   * Genera un access_token de corta duración (15 min)
   */
  private generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload, {
      expiresIn:
        this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
    });
  }

  /**
   * Genera un refresh_token único (UUID)
   * NO usa JWT, es más simple y seguro (revocable en BD)
   */
  private generateRefreshToken(): string {
    return uuidv4();
  }
}