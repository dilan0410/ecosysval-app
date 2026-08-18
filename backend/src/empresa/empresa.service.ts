import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './empresa.entity';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async crear(empresaData: Partial<Empresa>) {
    const empresa = this.empresaRepository.create(empresaData);
    return this.empresaRepository.save(empresa);
  }

  async obtenerTodas() {
    return this.empresaRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Obtener empresas por código SCIAN
  async obtenerPorSectorScian(sectorScian: string) {
    // Soportar múltiples SCIANs separados por coma
    // Ejemplo: "1123,1122,3113" → busca empresas de esos 3 sectores
    const codigos = sectorScian
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    if (codigos.length === 0) {
      return [];
    }

    // Si es solo 1 SCIAN, usar findOne más simple
    if (codigos.length === 1) {
      return this.empresaRepository.find({
        where: { sectorScian: codigos[0] },
        order: { createdAt: 'DESC' },
      });
    }

    // Múltiples SCIANs: usar IN query
    return this.empresaRepository
      .createQueryBuilder('empresa')
      .where('empresa.sectorScian IN (:...codigos)', { codigos })
      .orderBy('empresa.createdAt', 'DESC')
      .getMany();
}

  // Método para explorar empresas con filtros y paginación
  async explorar(params: {
    q?: string;
    estado?: string;
    empleados?: string;
    ordenar?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      q,
      estado,
      empleados,
      ordenar = 'recientes',
      page = 1,
      limit = 12,
    } = params;

    const query = this.empresaRepository.createQueryBuilder('empresa');

    if (q && q.trim()) {
      const search = `%${q.trim().toLowerCase()}%`;
      query.andWhere(
        `(
          LOWER(empresa.razonSocial) LIKE :search
          OR LOWER(empresa.sectorScian) LIKE :search
          OR LOWER(empresa.estado) LIKE :search
          OR LOWER(CAST(empresa.productos AS TEXT)) LIKE :search
          OR LOWER(CAST(empresa.servicios AS TEXT)) LIKE :search
        )`,
        { search },
      );
    }

    if (estado && estado.trim()) {
      query.andWhere('empresa.estado = :estado', { estado });
    }

    if (empleados && empleados.trim()) {
      query.andWhere('empresa.empleados = :empleados', { empleados });
    }

    switch (ordenar) {
      case 'nombre':
        query.orderBy('empresa.razonSocial', 'ASC');
        break;
      case 'recientes':
      default:
        query.orderBy('empresa.createdAt', 'DESC');
        break;
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [empresas, total] = await query.getManyAndCount();

    const empresasConStats = await Promise.all(
      empresas.map(async (emp) => {
        const stats = await this.empresaRepository.manager
          .createQueryBuilder()
          .select('AVG(r.rating)', 'promedio')
          .addSelect('COUNT(r.id)', 'total')
          .from('resena', 'r')
          .where('r.empresaId = :id', { id: emp.id })
          .getRawOne();

        return {
          ...emp,
          rating: {
            promedio: stats?.promedio ? parseFloat(parseFloat(stats.promedio).toFixed(1)) : 0,
            total: parseInt(stats?.total || '0'),
          },
        };
      }),
    );

    if (ordenar === 'mejor-calificadas') {
      empresasConStats.sort((a, b) => {
        if (b.rating.promedio !== a.rating.promedio) {
          return b.rating.promedio - a.rating.promedio;
        }
        return b.rating.total - a.rating.total;
      });
    }

    return {
      empresas: empresasConStats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async obtenerEstadosUnicos() {
    const result = await this.empresaRepository
      .createQueryBuilder('empresa')
      .select('DISTINCT empresa.estado', 'estado')
      .where('empresa.estado IS NOT NULL')
      .andWhere("empresa.estado != ''")
      .orderBy('empresa.estado', 'ASC')
      .getRawMany();

    return result.map((r) => r.estado).filter(Boolean);
  }

  async obtenerRangosEmpleadosUnicos() {
    const result = await this.empresaRepository
      .createQueryBuilder('empresa')
      .select('DISTINCT empresa.empleados', 'empleados')
      .where('empresa.empleados IS NOT NULL')
      .andWhere("empresa.empleados != ''")
      .orderBy('empresa.empleados', 'ASC')
      .getRawMany();

    return result.map((r) => r.empleados).filter(Boolean);
  }

  async obtenerPorId(id: number) {
    return this.empresaRepository.findOne({ where: { id } });
  }

  // IMPORTANTE: Este método NO puede faltar
  async obtenerPorUserId(userId: number) {
    return this.empresaRepository.findOne({ where: { userId } });
  }

  async actualizar(id: number, data: Partial<Empresa>) {
    await this.empresaRepository.update(id, data);
    return this.obtenerPorId(id);
  }

  async eliminar(id: number) {
    await this.empresaRepository.delete(id);
    return { success: true };
  }
}