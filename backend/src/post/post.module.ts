// backend/src/post/post.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { User } from '../user/user.entity';
import { StorageModule } from '../common/storage/storage.module'; // NUEVO

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User]),
    StorageModule, // NUEVO
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}