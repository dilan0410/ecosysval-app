// backend/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UnauthorizedException,
  UseGuards,
  Request,
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
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // ==========================================
  // POST /auth/login — Iniciar sesión
  // ==========================================
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario y devuelve access_token (15 min) + refresh_token (30 días). ' +
      'Requiere email verificado. Límite: 5 intentos/min.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        user: {
          id: 42,
          name: 'Juan Pérez',
          email: 'juan@ejemplo.com',
          role: 'user',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 401,
    description: 'Credenciales incorrectas o email no verificado',
  })
  @ApiTooManyRequestsResponse({ description: 'Demasiados intentos' })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    return this.authService.login(user);
  }

  // ==========================================
  // POST /auth/refresh — Renovar access_token
  // ==========================================
  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10/min anti-spam
  @ApiOperation({
    summary: 'Renovar access_token',
    description:
      'Genera un nuevo access_token usando el refresh_token. ' +
      'El refresh_token debe ser válido y no haber expirado. ' +
      'Límite: 10 solicitudes por minuto.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token renovado correctamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes' })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshTokens(body.refresh_token);
  }

  // ==========================================
  // POST /auth/logout — Cerrar sesión
  // ==========================================
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Invalida el refresh_token del usuario. Requiere access_token válido.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada correctamente',
    schema: {
      example: {
        success: true,
        message: 'Sesión cerrada correctamente',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async logout(@Request() req: any) {
    // req.user viene del JwtStrategy (después del JwtAuthGuard)
    return this.authService.logout(req.user.id);
  }

  // ==========================================
  // GET /auth/verify — Verificar email
  // ==========================================
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

  // ==========================================
  // POST /auth/resend-verification — Reenviar email
  // ==========================================
  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({
    summary: 'Reenviar email de verificación',
    description: 'Reenvía el email de verificación al usuario. Límite: 3/min.',
  })
  async resendVerification(@Body() body: { email: string }) {
    return this.userService.resendVerification(body.email);
  }

  // ==========================================
  // POST /auth/forgot-password
  // ==========================================
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña',
    description:
      'Envía un email al usuario con un link para restablecer su contraseña. ' +
      'Por seguridad, siempre devuelve el mismo mensaje aunque el email no exista. ' +
      'Límite: 3 solicitudes por minuto.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email enviado (si el usuario existe)',
    schema: {
      example: {
        success: true,
        message:
          'Si el email está registrado, recibirás un correo con instrucciones.',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Email con formato inválido' })
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.userService.requestPasswordReset(body.email);
  }

  // ==========================================
  // POST /auth/reset-password
  // ==========================================
  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Resetear contraseña con token',
    description:
      'Establece una nueva contraseña usando el token recibido por email. ' +
      'El token es de un solo uso y expira en 1 hora. ' +
      'Límite: 5 intentos por minuto.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada correctamente',
    schema: {
      example: {
        success: true,
        message:
          'Contraseña restablecida correctamente. Ya puedes iniciar sesión.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o token expirado',
  })
  @ApiResponse({ status: 404, description: 'Token inválido o ya utilizado' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.userService.resetPassword(
      body.token,
      body.password,
      body.confirmPassword,
    );
  }

  // ==========================================
  // POST /auth/profile (temporal)
  // ==========================================
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