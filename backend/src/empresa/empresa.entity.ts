import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  razonSocial: string;

  @Column()
  correo: string;

  @Column({ nullable: true })
  ambito: string;

  @Column({ nullable: true })
  ubicacion: string;

  @Column({ nullable: true })
  representante: string;

  @Column({ nullable: true })
  paginaWeb: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  volumenVentas: string;

  @Column({ nullable: true, default: 0 })
  empleados: number;

  @Column({ nullable: true })
  antiguedad: string;

  @Column({ type: 'text', nullable: true })
  mision: string;

  @Column({ type: 'text', nullable: true })
  vision: string;

  @Column({ nullable: true })
  sucursales: string;

  @Column({ nullable: true })
  socios: string;

  @Column({ default: false })
  importaciones: boolean;

  @Column({ default: false })
  exportaciones: boolean;

  @Column({ nullable: true })
  productos: string;

  @Column({ nullable: true })
  servicios: string;

  @Column({ nullable: true })
  objetivos: string;

  @Column({ nullable: true, length: 10 })
  scianCodigo: string;

  @Column({ nullable: true, type: 'text' })
  scianDescripcion: string;

  // Vincula la empresa con el usuario dueño
  @Column({ nullable: true })
  userId?: number;

  // Paquete elegido al registrarse
  @Column({ default: 'basico' })
  paquete: string;

  @CreateDateColumn()
  createdAt: Date;
}