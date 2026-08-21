// backend/src/mensaje/mensaje.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Conversacion } from './conversacion.entity';

@Entity('mensaje')
@Index(['conversacionId', 'createdAt'])
@Index(['conversacionId', 'leido'])
@Index(['senderId'])
export class Mensaje {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  conversacionId: number;

  @ManyToOne(() => Conversacion, (c) => c.mensajes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversacionId' })
  conversacion: Conversacion;

  @Column()
  senderId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ default: false })
  leido: boolean;

  @Column({ type: 'timestamp', nullable: true })
  leidoAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}