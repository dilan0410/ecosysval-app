// backend/src/post/post.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, In } from 'typeorm';
import { Post } from './post.entity';
import { User } from '../user/user.entity';
import { Empresa } from '../empresa/empresa.entity'; 
import { StorageService } from '../common/storage/storage.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    // Repositorio de Empresa
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    private readonly storageService: StorageService,
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

  // ==========================================
  // MEJORADO: Incluir logo de empresa
  // ==========================================
  async getUserPosts(userId: number): Promise<any[]> {
    const posts = await this.postRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return this.enriquecerPostsConEmpresa(posts);
  }

  async editPost(postId: number, content: string): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Publicación no encontrada');

    post.content = content;
    return this.postRepository.save(post);
  }

  async deletePost(postId: number): Promise<{ success: boolean }> {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (post.image && post.image.includes('supabase')) {
      try {
        await this.storageService.deleteFile(post.image);
      } catch (err) {
        console.error('Error al eliminar imagen de Supabase:', err.message);
      }
    }

    if (post.video && post.video.includes('supabase')) {
      try {
        await this.storageService.deleteFile(post.video);
      } catch (err) {
        console.error('Error al eliminar video de Supabase:', err.message);
      }
    }

    await this.postRepository.delete(postId);

    return { success: true };
  }

  // ==========================================
  // MEJORADO: getFeed con logo de empresa
  // ==========================================
  async getFeed(): Promise<any[]> {
    const posts = await this.postRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return this.enriquecerPostsConEmpresa(posts);
  }

  // ==========================================
  // HELPER PRIVADO: Enriquecer posts con datos de empresa
  // ==========================================
  /**
   * Toma un array de posts y le agrega a cada uno los datos
   * de la empresa asociada al usuario (logo, razón social, etc.).
   *
   * Optimizado: hace solo 1 query extra sin importar cuántos posts.
   */
  private async enriquecerPostsConEmpresa(posts: Post[]): Promise<any[]> {
    if (posts.length === 0) return [];

    // 1. Extraer todos los userIds únicos
    const userIds = [...new Set(posts.map((p) => p.user?.id).filter(Boolean))];

    if (userIds.length === 0) return posts;

    // 2. Buscar todas las empresas de esos usuarios en 1 sola query
    const empresas = await this.empresaRepository.find({
      where: { userId: In(userIds) },
    });

    // 3. Crear un mapa userId → empresa para lookup rápido
    const empresaPorUserId = new Map<number, Empresa>();
    empresas.forEach((empresa) => {
      if (empresa.userId) {
        empresaPorUserId.set(empresa.userId, empresa);
      }
    });

    // 4. Enriquecer cada post con datos de su empresa
    return posts.map((post) => {
      const empresa = post.user?.id
        ? empresaPorUserId.get(post.user.id)
        : null;

      return {
        ...post,
        user: post.user
          ? {
              ...post.user,
              // Agregamos la empresa dentro del user
              empresa: empresa
                ? {
                    id: empresa.id,
                    razonSocial: empresa.razonSocial,
                    logo: empresa.logo, // EL LOGO QUE NECESITAMOS
                  }
                : null,
            }
          : null,
      };
    });
  }
}