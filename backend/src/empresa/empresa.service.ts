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
        createdAt: 'DESC', // Más recientes primero
      },
    });
  }

  // NUEVO: Método para explorar empresas con filtros y paginación
  async explorar(params: {
    q?: string;              // Texto de búsqueda
    estado?: string;         // Filtro por estado
    empleados?: string;      // Filtro por rango de empleados
    ordenar?: string;        // 'recientes' | 'nombre' | 'mejor-calificadas'
    page?: number;           // Página actual (default 1)
    limit?: number;          // Empresas por página (default 12)
  }) {
    const {
      q,
      estado,
      empleados,
      ordenar = 'recientes',
      page = 1,
      limit = 12,
    } = params;

    // Construir query con TypeORM QueryBuilder
    const query = this.empresaRepository.createQueryBuilder('empresa');

    // BÚSQUEDA POR TEXTO
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

    // FILTRO POR ESTADO
    if (estado && estado.trim()) {
      query.andWhere('empresa.estado = :estado', { estado });
    }

    // FILTRO POR EMPLEADOS
    if (empleados && empleados.trim()) {
      query.andWhere('empresa.empleados = :empleados', { empleados });
    }

    // ORDENAMIENTO
    switch (ordenar) {
      case 'nombre':
        query.orderBy('empresa.razonSocial', 'ASC');
        break;
      case 'recientes':
      default:
        query.orderBy('empresa.createdAt', 'DESC');
        break;
      // 'mejor-calificadas' se maneja después de traer los datos
    }

    // PAGINACIÓN
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Ejecutar
    const [empresas, total] = await query.getManyAndCount();

    // AGREGAR ESTADÍSTICAS DE RESEÑAS A CADA EMPRESA
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

    // Si ordenamos por mejor calificadas, ordenamos AQUÍ (después de traer stats)
    if (ordenar === 'mejor-calificadas') {
      empresasConStats.sort((a, b) => {
        // Primero por promedio, después por total de reseñas
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

  // NUEVO: Obtener estados únicos para el filtro
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

  // NUEVO: Obtener rangos de empleados únicos
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
