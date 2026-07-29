// backend/src/notificacion/notificacion.entity.ts
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

@Entity()
@Index(['userId', 'leida']) // Índice para búsquedas rápidas
@Index(['userId', 'createdAt']) // Índice para orden temporal
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number;

  // ==========================================
  // Destinatario de la notificación
  // ==========================================
  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ==========================================
  // Tipo de notificación
  // ==========================================
  @Column({ type: 'varchar', length: 50 })
  tipo: string; // 'resena_nueva' | 'resena_editada' | 'resena_eliminada'

  // ==========================================
  // Contenido
  // ==========================================
  @Column({ type: 'varchar', length: 200 })
  titulo: string; // "Nueva reseña recibida"

  @Column({ type: 'text' })
  mensaje: string; // "Empresa X dejó una calificación de 5 estrellas"

  // ==========================================
  // Enlaces útiles
  // ==========================================
  @Column({ type: 'varchar', length: 200, nullable: true })
  enlace: string; // URL a la que ir al hacer click (ej: /empresa/5)

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // Datos extra: { empresaId, rating, autorId, etc }

  // ==========================================
  // Estado
  // ==========================================
  @Column({ default: false })
  leida: boolean;

  @Column({ type: 'timestamp', nullable: true })
  leidaAt: Date;

  // ==========================================
  // Timestamp
  // ==========================================
  @CreateDateColumn()
  createdAt: Date;
}