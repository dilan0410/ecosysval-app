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

  async obtenerPorId(id: number) {
    return this.empresaRepository.findOne({ where: { id } });
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
