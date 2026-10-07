// backend/src/solicitudes-comercio/solicitudes-comercio.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudComercio } from './solicitud-comercio.entity';
import { Empresa } from '../empresa/empresa.entity';
import { NotificacionService } from '../notificacion/notificacion.service';

@Injectable()
export class SolicitudesComercioService {
  constructor(
    @InjectRepository(SolicitudComercio)
    private readonly solicitudRepo: Repository<SolicitudComercio>,
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    private readonly notificacionService: NotificacionService,
  ) {}

  async crearSolicitud(data: Partial<SolicitudComercio>) {
    const cut = (str?: string, max = 245) =>
      str && str.length > max ? str.slice(0, max - 3) + '...' : str;

    if (data.producto) data.producto = cut(data.producto);
    if (data.empresaEmisora) data.empresaEmisora = cut(data.empresaEmisora);
    if (data.empresaDestino) data.empresaDestino = cut(data.empresaDestino);

    const solicitud = this.solicitudRepo.create(data);
    const saved = await this.solicitudRepo.save(solicitud);

    if (data.empresaDestinoId) {
      try {
        const empresaDestino = await this.empresaRepo.findOne({
          where: { id: Number(data.empresaDestinoId) },
        });

        const ownerUserId = empresaDestino?.userId;

        if (ownerUserId) {
          await this.notificacionService.notificarSolicitudComercio({
            userId: Number(ownerUserId),
            empresaId: Number(data.empresaDestinoId),
            empresaEmisoraNombre: data.empresaEmisora || 'Una empresa del ecosistema',
            tipoItem: data.tipoItem || 'producto',
            producto: data.producto || 'Producto no especificado',
            transaccion: data.transaccion || 'compra',
            cantidad: data.cantidad,
            unidad: data.unidad,
            descripcion: data.descripcion,
            solicitudId: saved.id,
          });
        }
      } catch (notifErr) {
        console.warn(
          'Solicitud guardada, pero ocurrió un error al notificar:',
          notifErr?.message || notifErr,
        );
      }
    }

    return saved;
  }

  async obtenerPorId(id: number) {
    const solicitud = await this.solicitudRepo.findOne({ where: { id } });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    return solicitud;
  }

  async obtenerPorEmpresa(userId: number) {
    const empresa = await this.empresaRepo.findOne({ where: { userId } });
    const empresaId = empresa?.id;

    return this.solicitudRepo.find({
      where: [
        { empresaEmisoraId: userId },
        { empresaDestinoId: userId },
        ...(empresaId ? [{ empresaDestinoId: empresaId }, { empresaEmisoraId: empresaId }] : []),
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async actualizarEstado(id: number, status: string) {
    const solicitud = await this.solicitudRepo.findOne({ where: { id } });
    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    solicitud.status = status;
    return this.solicitudRepo.save(solicitud);
  }
}