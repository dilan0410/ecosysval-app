// backend/src/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler'; // NUEVO
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTooManyRequestsResponse, // NUEVO
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  // NUEVO: Solo 5 intentos por minuto para prevenir fuerza bruta
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario con email y contraseña. Devuelve un JWT. ' +
      'Límite: 5 intentos por minuto para prevenir ataques de fuerza bruta.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso. Devuelve el access_token.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          name: 'Juan Perez',
          email: 'juan@ejemplo.com',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  @ApiTooManyRequestsResponse({
    description: 'Demasiados intentos. Espera 1 minuto.',
  })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return this.authService.login(user);
  }

  @Post('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener perfil (temporal)',
    description: 'Endpoint temporal. Necesita mejorarse con JwtAuthGuard.',
  })
  async profile(@Body() body: { token: string }) {
    return { message: 'Perfil cargado correctamente' };
  }
}