// backend/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTooManyRequestsResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService, // NUEVO
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario. Requiere email verificado. Límite: 5 intentos/min.',
  })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas o email no verificado' })
  @ApiTooManyRequestsResponse({ description: 'Demasiados intentos' })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return this.authService.login(user);
  }

  // NUEVO: Verificar email
  @Get('verify')
  @ApiOperation({
    summary: 'Verificar email',
    description: 'Verifica el email de un usuario mediante el token del enlace.',
  })
  @ApiQuery({ name: 'token', description: 'Token de verificación (UUID)' })
  @ApiResponse({ status: 200, description: 'Email verificado correctamente' })
  @ApiResponse({ status: 404, description: 'Token inválido' })
  async verifyEmail(@Query('token') token: string) {
    return this.userService.verifyEmail(token);
  }

  // NUEVO: Reenviar email de verificación
  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({
    summary: 'Reenviar email de verificación',
    description: 'Reenvía el email de verificación al usuario. Límite: 3/min.',
  })
  async resendVerification(@Body() body: { email: string }) {
    return this.userService.resendVerification(body.email);
  }

  @Post('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener perfil (temporal)' })
  async profile(@Body() body: { token: string }) {
    return { message: 'Perfil cargado correctamente' };
  }
}