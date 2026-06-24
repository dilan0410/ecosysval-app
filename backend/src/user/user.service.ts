import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Crear un nuevo usuario
  async create(user: Partial<User>) {
    // Hashear la contraseña antes de guardar
    if (user.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, salt);
    }
    return this.userRepository.save(user);
  }

  // Obtener todos los usuarios
  findAll() {
    return this.userRepository.find({
      order: {
      id: 'DESC', // 'ASC' = ascendente, 'DESC' = descendente
    },
  });
}

  // Obtener un usuario por su ID
  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  // Buscar usuario por email (para login)
  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  // Actualizar datos generales del usuario
  async update(id: number, user: Partial<User>) {
    if (user.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, salt);
    }
    return this.userRepository.update(id, user);
  }

  // Actualizar imágenes de perfil y banner
  async updateImages(id: number, data: { profile_image?: string; banner_image?: string }) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Si llega una imagen de perfil, actualizamos
    if (data.profile_image !== undefined) {
      user.profile_image = data.profile_image;
    }

    // Si llega una imagen de banner, actualizamos
    if (data.banner_image !== undefined) {
      user.banner_image = data.banner_image;
    }

    return this.userRepository.save(user);
  }

  // Eliminar un usuario
  remove(id: number) {
    return this.userRepository.delete(id);
  }
}
