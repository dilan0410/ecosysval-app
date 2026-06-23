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
  profile_image: string;

  @Column({ type: 'text', nullable: true })
  banner_image: string;

  // NUEVO CAMPO: ROL DEL USUARIO
  @Column({ default: 'user' })
  role: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}