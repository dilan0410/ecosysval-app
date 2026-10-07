import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('solicitud_comercio')
export class SolicitudComercio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  empresaEmisoraId: number;

  @Column({ type: 'int', nullable: true })
  empresaDestinoId: number;

  @Column({ type: 'varchar', length: 255 })
  empresaEmisora: string;

  @Column({ type: 'varchar', length: 255 })
  empresaDestino: string;

  @Column({ type: 'varchar', length: 50 })
  transaccion: string; // 'compra' o 'venta'

  @Column({ type: 'varchar', length: 50 })
  tipoItem: string; // 'producto' o 'servicio'

  @Column({ type: 'varchar', length: 255 })
  producto: string;

  @Column({ type: 'varchar', length: 50 })
  unidad: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'varchar', length: 50, default: 'pendiente' })
  status: string; // 'pendiente', 'aceptada', 'rechazada'

  @Column({ type: 'jsonb', nullable: true })
  empresaData: any;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'empresaEmisoraId' })
  emisor: User;
}