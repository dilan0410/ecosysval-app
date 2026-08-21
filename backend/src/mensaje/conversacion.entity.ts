// backend/src/mensaje/conversacion.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Mensaje } from './mensaje.entity';

@Entity('conversacion')
@Unique(['participante1Id', 'participante2Id'])
@Index(['participante1Id', 'updatedAt'])
@Index(['participante2Id', 'updatedAt'])
export class Conversacion {
  @PrimaryGeneratedColumn()
  id: number;

  // Convención: siempre el menor ID en p1 y el mayor en p2
  // así A-B y B-A son la misma conversación
  @Column()
  participante1Id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participante1Id' })
  participante1: User;

  @Column()
  participante2Id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participante2Id' })
  participante2: User;

  @Column({ type: 'text', nullable: true })
  ultimoMensaje: string | null;

  @Column({ type: 'timestamp', nullable: true })
  ultimoMensajeAt: Date | null;

  @Column({ type: 'int', nullable: true })
  ultimoSenderId: number | null;

  @OneToMany(() => Mensaje, (m) => m.conversacion)
  mensajes: Mensaje[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}