// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
// WINSTON
import { AppLoggerService } from '../common/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    // WINSTON
    private readonly logger: AppLoggerService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      // WINSTON: Login fallido - usuario no existe
      this.logger.userLoginFailed(email, 'user_not_found');
      return null;
    }

    const passwordValido = await bcrypt.compare(pass, user.password);
    if (!passwordValido) {
      // WINSTON: Login fallido - contraseña incorrecta
      this.logger.userLoginFailed(email, 'invalid_password');
      return null;
    }

    // Verificar que el email esté confirmado
    if (!user.email_verified) {
      // WINSTON: Login fallido - email no verificado
      this.logger.userLoginFailed(email, 'email_not_verified');
      throw new UnauthorizedException(
        'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.',
      );
    }

    const { password, verification_token, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // WINSTON: Login exitoso
    this.logger.userLoginSuccess(user.id, user.email);

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}