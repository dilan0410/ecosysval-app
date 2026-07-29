// backend/src/notificacion/notificacion.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './notificacion.entity';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';

@Injectable()
export class NotificacionService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notifRepo: Repository<Notificacion>,
  ) {}

  // ==========================================
  // CREAR notificación (uso interno)
  // Este método NO se expone como endpoint,
  // se llama desde otros servicios (ResenaService)
  // ==========================================
  async crear(dto: CreateNotificacionDto): Promise<Notificacion> {
    const notif = this.notifRepo.create(dto);
    return this.notifRepo.save(notif);
  }

  // ==========================================
  // OBTENER mis notificaciones (con paginación)
  // ==========================================
  async obtenerMias(userId: number, params: { page?: number; limit?: number } = {}) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50); // Máximo 50 por página
    const skip = (page - 1) * limit;

    const [notificaciones, total] = await this.notifRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Contar no leídas (para el badge)
    const noLeidas = await this.notifRepo.count({
      where: { userId, leida: false },
    });

    return {
      notificaciones,
      total,
      noLeidas,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==========================================
  // CONTAR no leídas (para el badge del header)
  // Endpoint ligero, solo devuelve el número
  // ==========================================
  async contarNoLeidas(userId: number): Promise<{ count: number }> {
    const count = await this.notifRepo.count({
      where: { userId, leida: false },
    });
    return { count };
  }

  // ==========================================
  // MARCAR como leída (una notificación)
  // ==========================================
  async marcarLeida(id: number, userId: number) {
    const notif = await this.notifRepo.findOne({ where: { id } });

    if (!notif) {
      throw new NotFoundException('Notificación no encontrada');
    }

    // Solo el dueño puede marcarla como leída
    if (notif.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta notificación',
      );
    }

    if (!notif.leida) {
      notif.leida = true;
      notif.leidaAt = new Date();
      await this.notifRepo.save(notif);
    }

    return notif;
  }

  // ==========================================
  // MARCAR todas como leídas
  // ==========================================
  async marcarTodasLeidas(userId: number) {
    const result = await this.notifRepo.update(
      { userId, leida: false },
      { leida: true, leidaAt: new Date() },
    );

    return {
      success: true,
      message: `${result.affected || 0} notificaciones marcadas como leídas`,
      count: result.affected || 0,
    };
  }

  // ==========================================
  // ELIMINAR una notificación
  // ==========================================
  async eliminar(id: number, userId: number) {
    const notif = await this.notifRepo.findOne({ where: { id } });

    if (!notif) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notif.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta notificación',
      );
    }

    await this.notifRepo.delete(id);
    return { success: true, message: 'Notificación eliminada' };
  }

  // ==========================================
  // ELIMINAR todas las notificaciones leídas
  // (limpieza del usuario)
  // ==========================================
  async eliminarTodasLeidas(userId: number) {
    const result = await this.notifRepo.delete({ userId, leida: true });

    return {
      success: true,
      message: `${result.affected || 0} notificaciones eliminadas`,
      count: result.affected || 0,
    };
  }

  // ==========================================
  // HELPER: Crear notificación de reseña nueva
  // Se llama desde ResenaService
  // ==========================================
  async notificarResenaNueva(params: {
    empresaOwnerId: number; // Dueño de la empresa que recibe la reseña
    empresaId: number;
    autorNombre: string;
    rating: number;
    resenaId: number;
  }) {
    return this.crear({
      userId: params.empresaOwnerId,
      tipo: 'resena_nueva',
      titulo: 'Nueva reseña recibida',
      mensaje: `${params.autorNombre} dejó una calificación de ${params.rating} ${params.rating === 1 ? 'estrella' : 'estrellas'}`,
      enlace: `/empresa/${params.empresaId}`,
      metadata: {
        empresaId: params.empresaId,
        resenaId: params.resenaId,
        rating: params.rating,
      },
    });
  }

  // ==========================================
  // HELPER: Crear notificación de reseña editada
  // ==========================================
  async notificarResenaEditada(params: {
    empresaOwnerId: number;
    empresaId: number;
    autorNombre: string;
    ratingNuevo: number;
    resenaId: number;
  }) {
    return this.crear({
      userId: params.empresaOwnerId,
      tipo: 'resena_editada',
      titulo: 'Una reseña fue editada',
      mensaje: `${params.autorNombre} actualizó su reseña (ahora ${params.ratingNuevo} ${params.ratingNuevo === 1 ? 'estrella' : 'estrellas'})`,
      enlace: `/empresa/${params.empresaId}`,
      metadata: {
        empresaId: params.empresaId,
        resenaId: params.resenaId,
        rating: params.ratingNuevo,
      },
    });
  }

  // ==========================================
  // HELPER: Crear notificación de reseña eliminada
  // ==========================================
  async notificarResenaEliminada(params: {
    empresaOwnerId: number;
    empresaId: number;
    autorNombre: string;
  }) {
    return this.crear({
      userId: params.empresaOwnerId,
      tipo: 'resena_eliminada',
      titulo: 'Una reseña fue eliminada',
      mensaje: `${params.autorNombre} eliminó su reseña de tu empresa`,
      enlace: `/empresa/${params.empresaId}`,
      metadata: {
        empresaId: params.empresaId,
      },
    });
  }
}