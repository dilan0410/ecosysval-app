// backend/src/mensaje/mensaje.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversacion } from './conversacion.entity';
import { Mensaje } from './mensaje.entity';
import { NotificacionService } from '../notificacion/notificacion.service';

@Injectable()
export class MensajeService {
  constructor(
    @InjectRepository(Conversacion)
    private readonly convRepo: Repository<Conversacion>,
    @InjectRepository(Mensaje)
    private readonly msgRepo: Repository<Mensaje>,
    private readonly notifService: NotificacionService,
  ) {}

  /** Ordena IDs para unicidad (La conversacion A-B es la misma que B-A) */
  private ordenarParticipantes(a: number, b: number) {
    return a < b ? { p1: a, p2: b } : { p1: b, p2: a };
  }

  private esParticipante(conv: Conversacion, userId: number) {
    return conv.participante1Id === userId || conv.participante2Id === userId;
  }

  private otroParticipante(conv: Conversacion, userId: number) {
    return conv.participante1Id === userId
      ? conv.participante2Id
      : conv.participante1Id;
  }

  // 1. OBTENER O CREAR CONVERSACIÓN
  async obtenerOCrearConversacion(userId: number, otroUserId: number, mensajeInicial?: string) {
    if (userId === otroUserId) {
      throw new BadRequestException('No puedes chatear contigo mismo');
    }

    const { p1, p2 } = this.ordenarParticipantes(userId, otroUserId);

    let conv = await this.convRepo.findOne({
      where: { participante1Id: p1, participante2Id: p2 },
      relations: ['participante1', 'participante2'],
    });

    if (!conv) {
      conv = this.convRepo.create({
        participante1Id: p1,
        participante2Id: p2,
        ultimoMensaje: null,
      });
      conv = await this.convRepo.save(conv);
      // Recargar para tener las relaciones de usuario
      conv = await this.convRepo.findOne({
        where: { id: conv.id },
        relations: ['participante1', 'participante2'],
      });
    }

    let mensajeGuardado: any = null;
    if (mensajeInicial?.trim()) {
      mensajeGuardado = await this.enviarMensaje(conv!.id, userId, mensajeInicial.trim());
    }

    return {
      conversacion: this.formatearConversacion(conv!, userId),
      mensaje: mensajeGuardado,
    };
  }

  // 2. LISTAR MIS CONVERSACIONES
  async listarConversaciones(userId: number) {
    const convs = await this.convRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.participante1', 'p1')
      .leftJoinAndSelect('c.participante2', 'p2')
      .where('c.participante1Id = :userId OR c.participante2Id = :userId', { userId })
      .orderBy('COALESCE(c.ultimoMensajeAt, c.createdAt)', 'DESC')
      .getMany();

    return Promise.all(
      convs.map(async (c) => ({
        ...this.formatearConversacion(c, userId),
        noLeidos: await this.msgRepo
          .createQueryBuilder('m')
          .where('m.conversacionId = :cid', { cid: c.id })
          .andWhere('m.leido = false')
          .andWhere('m.senderId != :userId', { userId })
          .getCount(),
      })),
    );
  }

  // 3. DETALLE DE CONVERSACIÓN
  async obtenerConversacion(convId: number, userId: number) {
    const conv = await this.convRepo.findOne({
      where: { id: convId },
      relations: ['participante1', 'participante2'],
    });

    if (!conv) throw new NotFoundException('Conversación no encontrada');
    if (!this.esParticipante(conv, userId)) throw new ForbiddenException('Sin acceso');

    return this.formatearConversacion(conv, userId);
  }

  // 4. LISTAR MENSAJES
  async listarMensajes(convId: number, userId: number, opts: { page?: number; limit?: number }) {
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const limit = opts.limit && opts.limit > 0 ? Math.min(opts.limit, 100) : 50;

    await this.obtenerConversacion(convId, userId); // valida existencia y acceso

    const [mensajes, total] = await this.msgRepo.findAndCount({
      where: { conversacionId: convId },
      relations: ['sender'],
      order: { createdAt: 'DESC' }, // Los más recientes primero para paginación
      skip: (page - 1) * limit,
      take: limit,
    });

    // Devolvemos en orden cronológico (más antiguo primero) para la UI del chat
    return {
      mensajes: mensajes.reverse().map((m) => this.formatearMensaje(m)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // 5. ENVIAR MENSAJE
  async enviarMensaje(convId: number, senderId: number, contenido: string) {
    const conv = await this.convRepo.findOne({
      where: { id: convId },
      relations: ['participante1', 'participante2'],
    });

    if (!conv) throw new NotFoundException('Conversación no encontrada');
    if (!this.esParticipante(conv, senderId)) throw new ForbiddenException('Sin acceso');

    const msg = await this.msgRepo.save(
      this.msgRepo.create({
        conversacionId: convId,
        senderId,
        contenido,
      }),
    );

    // Actualizar preview en la conversación
    conv.ultimoMensaje = contenido.length > 180 ? contenido.slice(0, 177) + '...' : contenido;
    conv.ultimoMensajeAt = msg.createdAt;
    conv.ultimoSenderId = senderId;
    await this.convRepo.save(conv);

    const msgFull = await this.msgRepo.findOne({
      where: { id: msg.id },
      relations: ['sender'],
    });

    // Enviar notificación al otro usuario
    const destinatarioId = this.otroParticipante(conv, senderId);
    const senderName = msgFull?.sender?.name || 'Un socio';

    try {
      await this.notifService.crear({
        userId: destinatarioId,
        tipo: 'mensaje_nuevo',
        titulo: 'Nuevo mensaje recibido',
        mensaje: `${senderName}: ${conv.ultimoMensaje}`,
        enlace: `/mensajes?c=${convId}`,
        metadata: { conversacionId: convId },
      });
    } catch (e) {
      console.warn('No se pudo crear notificación:', e); // No rompe el flujo si falla
    }

    return this.formatearMensaje(msgFull!);
  }

  // 6. MARCAR LEÍDOS
  async marcarLeidos(convId: number, userId: number) {
    await this.obtenerConversacion(convId, userId); // valida

    const result = await this.msgRepo
      .createQueryBuilder()
      .update(Mensaje)
      .set({ leido: true, leidoAt: () => 'NOW()' })
      .where('conversacionId = :convId', { convId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('leido = false')
      .execute();

    return { ok: true, marcados: result.affected || 0, conversacionId: convId };
  }

  // 7. CONTADOR GLOBAL NO LEÍDOS
  async contarNoLeidos(userId: number) {
    const count = await this.msgRepo
      .createQueryBuilder('m')
      .innerJoin('m.conversacion', 'c')
      .where('(c.participante1Id = :userId OR c.participante2Id = :userId)', { userId })
      .andWhere('m.senderId != :userId', { userId })
      .andWhere('m.leido = false')
      .getCount();
    return { noLeidos: count };
  }

  // HELPERS FORMATO
  private formatearConversacion(conv: Conversacion, userId: number) {
    const otro = conv.participante1Id === userId ? conv.participante2 : conv.participante1;
    return {
      id: conv.id,
      otroUsuario: otro
        ? { id: otro.id, name: otro.name, email: otro.email, profile_image: otro.profile_image }
        : null,
      ultimoMensaje: conv.ultimoMensaje,
      ultimoMensajeAt: conv.ultimoMensajeAt,
      ultimoSenderId: conv.ultimoSenderId,
      createdAt: conv.createdAt,
    };
  }

  private formatearMensaje(m: Mensaje) {
    return {
      id: m.id,
      conversacionId: m.conversacionId,
      senderId: m.senderId,
      sender: m.sender ? { id: m.sender.id, name: m.sender.name, profile_image: m.sender.profile_image } : null,
      contenido: m.contenido,
      leido: m.leido,
      leidoAt: m.leidoAt,
      createdAt: m.createdAt,
    };
  }
}