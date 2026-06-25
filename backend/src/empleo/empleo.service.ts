import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Empleo } from "./empleo.entity";
import { CreateEmpleoDto } from "./dto/create-empleo.dto";
import { UpdateEmpleoDto } from "./dto/update-empleo.dto";

@Injectable()
export class EmpleoService {
  constructor(
    @InjectRepository(Empleo)
    private readonly empleoRepo: Repository<Empleo>
  ) {}

  create(dto: CreateEmpleoDto) {
    const empleo = this.empleoRepo.create({
      ...dto,
      estado: "ACTIVA",
    });
    return this.empleoRepo.save(empleo);
  }

  findAll() {
    return this.empleoRepo.find({
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number) {
    const empleo = await this.empleoRepo.findOne({ where: { id } });
    if (!empleo) throw new NotFoundException("Empleo no encontrado");
    return empleo;
  }

  async update(id: number, dto: UpdateEmpleoDto) {
    const empleo = await this.findOne(id);
    Object.assign(empleo, dto);
    return this.empleoRepo.save(empleo);
  }

  async remove(id: number) {
    const empleo = await this.findOne(id);
    await this.empleoRepo.remove(empleo);
    return { success: true };
  }

  // opcional: cerrar oferta
  async cerrar(id: number) {
    const empleo = await this.findOne(id);
    empleo.estado = "CERRADA";
    return this.empleoRepo.save(empleo);
  }
    // opcional: reabrir oferta
  async reabrir(id: number) {
    const empleo = await this.findOne(id);
    empleo.estado = "ACTIVA";
    return this.empleoRepo.save(empleo);
  }

}
