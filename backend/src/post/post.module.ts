// backend/src/post/post.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { User } from '../user/user.entity';
import { Empresa } from '../empresa/empresa.entity';
import { StorageModule } from '../common/storage/storage.module';

@Module({
  imports: [
    // Agregamos Empresa al forFeature
    TypeOrmModule.forFeature([Post, User, Empresa]),
    StorageModule,
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}