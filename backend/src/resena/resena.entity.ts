// backend/src/resena/resena.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Empresa } from '../empresa/empresa.entity';
import { User } from '../user/user.entity';

@Entity()
// Un usuario solo puede tener UNA reseña por empresa
@Unique(['empresaId', 'userId'])
export class Resena {
  @PrimaryGeneratedColumn()
  id: number;

  // ==========================================
  // Relación con Empresa (a quién califican)
  // ==========================================
  @Column()
  empresaId: number;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresaId' })
  empresa: Empresa;

  // ==========================================
  // Relación con User (quién califica)
  // ==========================================
  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ==========================================
  // Datos de la reseña
  // ==========================================
  @Column({ type: 'int' })
  rating: number; // 1-5 estrellas

  @Column({ type: 'text', nullable: true })
  comentario: string;

  // ==========================================
  // Timestamps
  // ==========================================
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}