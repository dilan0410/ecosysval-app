// backend/src/user/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Post } from '../post/post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'text', nullable: true })
  profile_image: string | null;  // Cambio

  @Column({ type: 'text', nullable: true })
  banner_image: string | null;  // Cambio

  @Column({ default: 'user' })
  role: string;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ type: 'text', nullable: true })
  verification_token: string | null;  // Cambio

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}