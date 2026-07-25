// backend/src/resena/resena.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resena } from './resena.entity';
import { Empresa } from '../empresa/empresa.entity';
import { CreateResenaDto } from './dto/create-resena.dto';
import { UpdateResenaDto } from './dto/update-resena.dto';

@Injectable()
export class ResenaService {
  constructor(
    @InjectRepository(Resena)
    private readonly resenaRepo: Repository<Resena>,
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
  ) {}

  // ==========================================
  // CREAR reseña
  // ==========================================
  async crear(dto: CreateResenaDto, userId: number) {
    // Verificar que la empresa existe
    const empresa = await this.empresaRepo.findOne({
      where: { id: dto.empresaId },
    });
    if (!empresa) {
      throw new NotFoundException('La empresa no existe');
    }

    // REGLA: No puedes calificar tu propia empresa
    if (empresa.userId === userId) {
      throw new BadRequestException(
        'No puedes calificar tu propia empresa',
      );
    }

    // REGLA: Un usuario solo puede tener 1 reseña por empresa
    const existente = await this.resenaRepo.findOne({
      where: { empresaId: dto.empresaId, userId },
    });
    if (existente) {
      throw new ConflictException(
        'Ya has publicado una reseña para esta empresa. Puedes editarla.',
      );
    }

    // Crear la reseña
    const nueva = this.resenaRepo.create({
      empresaId: dto.empresaId,
      userId,
      rating: dto.rating,
      comentario: dto.comentario,
    });

    return this.resenaRepo.save(nueva);
  }

  // ==========================================
  // OBTENER reseñas de una empresa + estadísticas
  // ==========================================
  async obtenerPorEmpresa(empresaId: number) {
    // Verificar que la empresa existe
    const empresa = await this.empresaRepo.findOne({
      where: { id: empresaId },
    });
    if (!empresa) {
      throw new NotFoundException('La empresa no existe');
    }

    // Traer todas las reseñas con datos del autor
    const resenas = await this.resenaRepo.find({
      where: { empresaId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    // Para cada reseña, buscar la empresa del autor (si tiene)
    const resenasConAutor = await Promise.all(
      resenas.map(async (r) => {
        const empresaAutor = await this.empresaRepo.findOne({
          where: { userId: r.userId },
          select: ['id', 'razonSocial', 'logo'],
        });

        return {
          id: r.id,
          rating: r.rating,
          comentario: r.comentario,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          userId: r.userId,
          autor: {
            id: r.userId,
            nombre: r.user?.name || 'Usuario',
            empresa: empresaAutor
              ? {
                  id: empresaAutor.id,
                  razonSocial: empresaAutor.razonSocial,
                  logo: empresaAutor.logo,
                }
              : null,
          },
        };
      }),
    );

    // Calcular estadísticas
    const estadisticas = this.calcularEstadisticas(resenas);

    return {
      estadisticas,
      resenas: resenasConAutor,
    };
  }

  // ==========================================
  // OBTENER mis reseñas (las que YO he escrito)
  // ==========================================
  async obtenerMias(userId: number) {
    const resenas = await this.resenaRepo.find({
      where: { userId },
      relations: ['empresa'],
      order: { createdAt: 'DESC' },
    });

    return resenas.map((r) => ({
      id: r.id,
      rating: r.rating,
      comentario: r.comentario,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      empresa: {
        id: r.empresa?.id,
        razonSocial: r.empresa?.razonSocial,
        logo: r.empresa?.logo,
      },
    }));
  }

  // ==========================================
  // ACTUALIZAR reseña (solo el autor)
  // ==========================================
  async actualizar(id: number, dto: UpdateResenaDto, userId: number) {
    const resena = await this.resenaRepo.findOne({ where: { id } });
    if (!resena) {
      throw new NotFoundException('Reseña no encontrada');
    }

    // Solo el autor puede editar
    if (resena.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para editar esta reseña',
      );
    }

    // Actualizar campos
    if (dto.rating !== undefined) resena.rating = dto.rating;
    if (dto.comentario !== undefined) resena.comentario = dto.comentario;

    return this.resenaRepo.save(resena);
  }

  // ==========================================
  // ELIMINAR reseña (autor o admin)
  // ==========================================
  async eliminar(id: number, userId: number, role: string) {
    const resena = await this.resenaRepo.findOne({ where: { id } });
    if (!resena) {
      throw new NotFoundException('Reseña no encontrada');
    }

    // Solo el autor o un admin pueden eliminar
    if (resena.userId !== userId && role !== 'admin') {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta reseña',
      );
    }

    await this.resenaRepo.delete(id);
    return { success: true, message: 'Reseña eliminada correctamente' };
  }

  // ==========================================
  // HELPER: Calcular estadísticas
  // ==========================================
  private calcularEstadisticas(resenas: Resena[]) {
    const total = resenas.length;

    if (total === 0) {
      return {
        total: 0,
        promedio: 0,
        distribucion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    // Sumar todos los ratings
    const suma = resenas.reduce((acc, r) => acc + r.rating, 0);
    const promedio = parseFloat((suma / total).toFixed(1));

    // Contar cuántas reseñas hay por cada estrella
    const distribucion = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    resenas.forEach((r) => {
      distribucion[r.rating] = (distribucion[r.rating] || 0) + 1;
    });

    return {
      total,
      promedio,
      distribucion,
    };
  }
}