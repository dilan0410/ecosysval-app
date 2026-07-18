// backend/src/user/user.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '../mailer/mailer.service';
// WINSTON
import { AppLoggerService } from '../common/logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailerService: MailerService,
    // WINSTON
    private readonly logger: AppLoggerService,
  ) {}

  // ==========================================
  // Crear un nuevo usuario
  // ==========================================
  async create(user: Partial<User>) {
    // Hashear la contraseña
    if (user.password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
    }

    // Sistema híbrido de verificación
    const skipVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true';

    if (skipVerification) {
      user.email_verified = true;
      user.verification_token = null;
    } else {
      user.email_verified = false;
      user.verification_token = uuidv4();
    }

    // Guardar usuario
    const savedUser = await this.userRepository.save(user);

    // WINSTON: Log de registro exitoso
    this.logger.userRegistered(savedUser.id, savedUser.email);

    // Enviar email de verificación (solo si no se saltea)
    if (!skipVerification && user.email && user.verification_token) {
      try {
        await this.mailerService.enviarCorreoVerificacion(
          user.email,
          user.name || 'Usuario',
          user.verification_token,
        );
        // WINSTON: Log de email enviado
        this.logger.emailSent('verification', user.email);
      } catch (error) {
        // WINSTON: Log de error al enviar email
        this.logger.emailFailed('verification', user.email, error.message);
      }
    }

    return savedUser;
  }

  // ==========================================
  // Obtener todos los usuarios
  // ==========================================
  findAll() {
    return this.userRepository.find({
      order: { id: 'DESC' },
    });
  }

  // ==========================================
  // Obtener un usuario por su ID
  // ==========================================
  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  // ==========================================
  // Buscar usuario por email
  // ==========================================
  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  // ==========================================
  // Verificar email con token
  // ==========================================
  async verifyEmail(token: string) {
    const user = await this.userRepository.findOneBy({
      verification_token: token,
    });

    if (!user) {
      // WINSTON: Log de token inválido
      this.logger.warn('Intento de verificación con token inválido', 'UserService', {
        event: 'verification_invalid_token',
        token: token?.substring(0, 8) + '...', // Solo primeros 8 chars
      });
      throw new NotFoundException(
        'Token de verificación inválido o expirado',
      );
    }

    if (user.email_verified) {
      return {
        success: true,
        message: 'Este email ya fue verificado anteriormente',
        alreadyVerified: true,
      };
    }

    // Marcar como verificado y borrar el token
    user.email_verified = true;
    user.verification_token = null;
    await this.userRepository.save(user);

    // WINSTON: Log de verificación exitosa
    this.logger.userEmailVerified(user.id, user.email);

    return {
      success: true,
      message: 'Email verificado correctamente. Ya puedes iniciar sesión.',
      alreadyVerified: false,
    };
  }

  // ==========================================
  // Reenviar email de verificación
  // ==========================================
  async resendVerification(email: string) {
    const user = await this.findByEmail(email);

    if (!user) {
      // Por seguridad, no revelamos si el email existe
      return {
        message: 'Si el email está registrado, recibirás un correo de verificación.',
      };
    }

    if (user.email_verified) {
      return {
        message: 'Este email ya está verificado. Puedes iniciar sesión.',
      };
    }

    // Generar nuevo token
    user.verification_token = uuidv4();
    await this.userRepository.save(user);

    // Enviar email
    try {
      await this.mailerService.enviarCorreoVerificacion(
        user.email,
        user.name || 'Usuario',
        user.verification_token,
      );
      // WINSTON: Log de reenvío exitoso
      this.logger.emailSent('verification_resend', user.email);
    } catch (error) {
      // WINSTON: Log de fallo
      this.logger.emailFailed('verification_resend', user.email, error.message);
    }

    return {
      message: 'Email de verificación enviado. Revisa tu bandeja de entrada.',
    };
  }

  // ==========================================
  // Actualizar datos generales
  // ==========================================
  async update(id: number, user: Partial<User>) {
    if (user.password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
    }
    return this.userRepository.update(id, user);
  }

  // ==========================================
  // Actualizar imágenes
  // ==========================================
  async updateImages(
    id: number,
    data: { profile_image?: string; banner_image?: string },
  ) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (data.profile_image !== undefined) {
      user.profile_image = data.profile_image;
    }

    if (data.banner_image !== undefined) {
      user.banner_image = data.banner_image;
    }

    return this.userRepository.save(user);
  }

  // ==========================================
  // Eliminar usuario
  // ==========================================
  remove(id: number) {
    return this.userRepository.delete(id);
  }

  // ==========================================
  // SOLICITAR RECUPERACIÓN DE CONTRASEÑA
  // ==========================================
  async requestPasswordReset(email: string) {
    // WINSTON: Log de solicitud (útil para detectar ataques)
    this.logger.userPasswordResetRequested(email);

    const user = await this.findByEmail(email);

    // Por seguridad, NO revelamos si el email existe o no
    if (!user) {
      return {
        success: true,
        message:
          'Si el email está registrado, recibirás un correo con instrucciones.',
      };
    }

    // Generar token único (UUID)
    const token = uuidv4();

    // Expiración: 1 hora desde ahora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Guardar token y expiración en la BD
    user.reset_password_token = token;
    user.reset_password_expires = expiresAt;
    await this.userRepository.save(user);

    // Enviar email con el link
    try {
      await this.mailerService.enviarCorreoRecuperacion(
        user.email,
        user.name || 'Usuario',
        token,
      );
      // WINSTON: Log de email enviado
      this.logger.emailSent('password_reset', user.email);
    } catch (error) {
      // WINSTON: Log de error
      this.logger.emailFailed('password_reset', user.email, error.message);
      // No lanzamos error para no revelar si el email existe
    }

    return {
      success: true,
      message:
        'Si el email está registrado, recibirás un correo con instrucciones.',
    };
  }

  // ==========================================
  // RESETEAR CONTRASEÑA
  // ==========================================
  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string,
  ) {
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Buscar usuario por el token
    const user = await this.userRepository.findOneBy({
      reset_password_token: token,
    });

    if (!user) {
      // WINSTON: Log de token inválido (sospechoso)
      this.logger.securityAlert('Intento de reset con token inválido', {
        event: 'reset_invalid_token',
        token: token?.substring(0, 8) + '...',
      });
      throw new NotFoundException('Token inválido o ya utilizado');
    }

    // Verificar que el token NO haya expirado
    if (!user.reset_password_expires || user.reset_password_expires < new Date()) {
      // WINSTON: Log de token expirado
      this.logger.warn('Intento de reset con token expirado', 'UserService', {
        event: 'reset_expired_token',
        userId: user.id,
        email: user.email,
      });
      throw new BadRequestException(
        'El token ha expirado. Solicita uno nuevo.',
      );
    }

    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);

    // Borrar el token y la expiración (evita reutilización)
    user.reset_password_token = null;
    user.reset_password_expires = null;

    await this.userRepository.save(user);

    // WINSTON: Log de reset exitoso
    this.logger.userPasswordReset(user.id, user.email);

    return {
      success: true,
      message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.',
    };
  }
}