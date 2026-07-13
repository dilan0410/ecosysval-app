// backend/src/post/post.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Post } from './post.entity';
import { User } from '../user/user.entity';
import { StorageService } from '../common/storage/storage.service'; // NUEVO

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly storageService: StorageService, // NUEVO
  ) {}

  async createPost(
    userId: number,
    content: string,
    image?: string | null,
    video?: string | null,
  ): Promise<Post> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const post = this.postRepository.create({
      content,
      image: image ?? null,
      video: video ?? null,
      user,
    } as DeepPartial<Post>);

    return await this.postRepository.save(post);
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async editPost(postId: number, content: string): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Publicación no encontrada');

    post.content = content;
    return this.postRepository.save(post);
  }

  // ==========================================
  // MEJORADO: Eliminar también los archivos de Supabase
  // ==========================================
  async deletePost(postId: number): Promise<{ success: boolean }> {
    // Buscar el post primero para obtener las URLs
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Eliminar imagen de Supabase si existe
    if (post.image && post.image.includes('supabase')) {
      try {
        await this.storageService.deleteFile(post.image);
      } catch (err) {
        console.error('Error al eliminar imagen de Supabase:', err.message);
        // No fallamos si no se puede eliminar el archivo, seguimos con el borrado
      }
    }

    // Eliminar video de Supabase si existe
    if (post.video && post.video.includes('supabase')) {
      try {
        await this.storageService.deleteFile(post.video);
      } catch (err) {
        console.error('Error al eliminar video de Supabase:', err.message);
      }
    }

    // Eliminar el post de la BD
    await this.postRepository.delete(postId);

    return { success: true };
  }

  async getFeed(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}