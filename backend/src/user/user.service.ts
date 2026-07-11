// backend/src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; // NUEVO
import { MailerService } from '../mailer/mailer.service'; // NUEVO

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailerService: MailerService, // NUEVO
  ) {}

  // Crear un nuevo usuario
  async create(user: Partial<User>) {
    // Hashear la contraseña
    if (user.password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
    }

    // NUEVO: Sistema híbrido de verificación
    const skipVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true';

    if (skipVerification) {
      // Modo desarrollo: marcar como verificado automáticamente
      user.email_verified = true;
      user.verification_token = null;
    } else {
      // Modo producción: requiere verificar por email
      user.email_verified = false;
      user.verification_token = uuidv4(); // Token único
    }

    // Guardar usuario
    const savedUser = await this.userRepository.save(user);

    // NUEVO: Enviar email de verificación (solo si no se saltea)
    if (!skipVerification && user.email && user.verification_token) {
      try {
        await this.mailerService.enviarCorreoVerificacion(
          user.email,
          user.name || 'Usuario',
          user.verification_token,
        );
      } catch (error) {
        console.error('Error enviando email de verificación:', error);
        // No fallamos el registro si falla el email, pero lo logeamos
      }
    }

    return savedUser;
  }

  // Obtener todos los usuarios
  findAll() {
    return this.userRepository.find({
      order: { id: 'DESC' },
    });
  }

  // Obtener un usuario por su ID
  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  // Buscar usuario por email
  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  // NUEVO: Verificar email con token
  async verifyEmail(token: string) {
    const user = await this.userRepository.findOneBy({
      verification_token: token,
    });

    if (!user) {
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

    return {
      success: true,
      message: 'Email verificado correctamente. Ya puedes iniciar sesión.',
      alreadyVerified: false,
    };
  }

  // NUEVO: Reenviar email de verificación
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
    await this.mailerService.enviarCorreoVerificacion(
      user.email,
      user.name || 'Usuario',
      user.verification_token,
    );

    return {
      message: 'Email de verificación enviado. Revisa tu bandeja de entrada.',
    };
  }

  // Actualizar datos generales
  async update(id: number, user: Partial<User>) {
    if (user.password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
    }
    return this.userRepository.update(id, user);
  }

  // Actualizar imágenes
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

  // Eliminar usuario
  remove(id: number) {
    return this.userRepository.delete(id);
  }
}