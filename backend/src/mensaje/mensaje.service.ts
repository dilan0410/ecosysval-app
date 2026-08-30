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
import { User } from '../user/user.entity';
import { Empresa } from '../empresa/empresa.entity';
import { NotificacionService } from '../notificacion/notificacion.service';

@Injectable()
export class MensajeService {
  constructor(
    @InjectRepository(Conversacion)
    private readonly convRepo: Repository<Conversacion>,
    @InjectRepository(Mensaje)
    private readonly msgRepo: Repository<Mensaje>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    private readonly notifService: NotificacionService,
  ) {}

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

  async obtenerOCrearConversacion(userId: number, otroUserId: number, mensajeInicial?: string) {
    if (userId === otroUserId) {
      throw new BadRequestException('No puedes chatear contigo mismo');
    }

    const otroUsuario = await this.userRepo.findOne({ where: { id: otroUserId } });
    if (!otroUsuario) {
      throw new NotFoundException(`El usuario destinatario no existe`);
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
      conv = await this.convRepo.findOne({
        where: { id: conv.id },
        relations: ['participante1', 'participante2'],
      });
    }

    let mensajeGuardado: any = null;
    if (mensajeInicial?.trim()) {
      mensajeGuardado = await this.enviarMensaje(conv!.id, userId, mensajeInicial.trim());
    }

    const conversacionFormateada = await this.formatearConversacion(conv!, userId);

    return {
      conversacion: conversacionFormateada,
      mensaje: mensajeGuardado,
    };
  }

  async listarConversaciones(userId: number) {
    const convs = await this.convRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.participante1', 'p1')
      .leftJoinAndSelect('c.participante2', 'p2')
      .where('c.participante1Id = :userId OR c.participante2Id = :userId', { userId })
      .orderBy('COALESCE(c.ultimoMensajeAt, c.createdAt)', 'DESC')
      .getMany();

    return Promise.all(
      convs.map(async (c) => {
        const formateada = await this.formatearConversacion(c, userId);
        const noLeidos = await this.msgRepo
          .createQueryBuilder('m')
          .where('m.conversacionId = :cid', { cid: c.id })
          .andWhere('m.leido = false')
          .andWhere('m.senderId != :userId', { userId })
          .getCount();

        return { ...formateada, noLeidos };
      }),
    );
  }

  async obtenerConversacion(convId: number, userId: number) {
    const conv = await this.convRepo.findOne({
      where: { id: convId },
      relations: ['participante1', 'participante2'],
    });

    if (!conv) throw new NotFoundException('Conversación no encontrada');
    if (!this.esParticipante(conv, userId)) throw new ForbiddenException('Sin acceso');

    return this.formatearConversacion(conv, userId);
  }

  async listarMensajes(convId: number, userId: number, opts: { page?: number; limit?: number }) {
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const limit = opts.limit && opts.limit > 0 ? Math.min(opts.limit, 100) : 50;

    await this.obtenerConversacion(convId, userId);

    const [mensajes, total] = await this.msgRepo.findAndCount({
      where: { conversacionId: convId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      mensajes: mensajes.reverse().map((m) => this.formatearMensaje(m)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

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

    conv.ultimoMensaje = contenido.length > 180 ? contenido.slice(0, 177) + '...' : contenido;
    conv.ultimoMensajeAt = msg.createdAt;
    conv.ultimoSenderId = senderId;
    await this.convRepo.save(conv);

    const msgFull = await this.msgRepo.findOne({
      where: { id: msg.id },
      relations: ['sender'],
    });

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
    } catch (e) {}

    return this.formatearMensaje(msgFull!);
  }

  // nuevo: eliminar mensaje (tipo whatsapp)

  async eliminarMensaje(convId: number, msgId: number, userId: number) {
    const mensaje = await this.msgRepo.findOne({ where: { id: msgId, conversacionId: convId } });

    if (!mensaje) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    // Solo el creador del mensaje puede eliminarlo
    if (mensaje.senderId !== userId) {
      throw new ForbiddenException('No puedes eliminar un mensaje que no enviaste');
    }

    await this.msgRepo.remove(mensaje);

    // Actualizar el preview de la conversación si eliminamos el último mensaje
    const conv = await this.convRepo.findOne({ where: { id: convId } });
    if (conv && conv.ultimoMensajeAt?.getTime() === mensaje.createdAt.getTime()) {
      // Buscar el nuevo "último mensaje"
      const ultimo = await this.msgRepo.findOne({
        where: { conversacionId: convId },
        order: { createdAt: 'DESC' },
      });

      if (ultimo) {
        conv.ultimoMensaje = ultimo.contenido.length > 180 ? ultimo.contenido.slice(0, 177) + '...' : ultimo.contenido;
        conv.ultimoMensajeAt = ultimo.createdAt;
        conv.ultimoSenderId = ultimo.senderId;
      } else {
        conv.ultimoMensaje = null;
        conv.ultimoMensajeAt = conv.createdAt;
        conv.ultimoSenderId = null;
      }
      await this.convRepo.save(conv);
    }

    return { success: true, message: 'Mensaje eliminado' };
  }

  async marcarLeidos(convId: number, userId: number) {
    await this.obtenerConversacion(convId, userId);

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

  // helper: obetener foto empresa o usuario

  private async formatearConversacion(conv: Conversacion, userId: number) {
    const otro = conv.participante1Id === userId ? conv.participante2 : conv.participante1;
    
    if (!otro) return { id: conv.id, otroUsuario: null };

    // Buscar si el usuario tiene una empresa registrada para usar su Logo
    const empresa = await this.empresaRepo.findOne({ where: { userId: otro.id } });
    
    // Prioridad: Logo de empresa > Foto de perfil > null
    const imagenFinal = empresa?.logo ? empresa.logo : otro.profile_image;
    const nombreFinal = empresa?.razonSocial ? empresa.razonSocial : otro.name;

    return {
      id: conv.id,
      otroUsuario: {
        id: otro.id,
        name: nombreFinal,
        email: otro.email,
        profile_image: imagenFinal,
      },
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
      contenido: m.contenido,
      leido: m.leido,
      leidoAt: m.leidoAt,
      createdAt: m.createdAt,
    };
  }
}