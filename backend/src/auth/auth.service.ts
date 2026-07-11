// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const passwordValido = await bcrypt.compare(pass, user.password);
    if (!passwordValido) {
      return null;
    }

    // NUEVO: Verificar que el email esté confirmado
    if (!user.email_verified) {
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
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}