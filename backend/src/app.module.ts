import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { User } from './user/user.entity';  
import { Post } from './post/post.entity'; 
import { EmpresaModule } from './empresa/empresa.module';
import { ContactModule } from './contact/contact.module'; 
import { EmpleoModule } from "./empleo/empleo.module";
import { StorageModule } from './common/storage/storage.module';
import { StorageService } from './common/storage/storage.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        if (process.env.NODE_ENV === 'test') {
          return {
            type: 'sqlite',
            database: ':memory:',
            dropSchema: true,
            autoLoadEntities: true,
            synchronize: true,
            entities: [User, Post], 
          };
        }

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: parseInt(config.get<string>('DB_PORT') ?? '5432', 10),
          username: config.get<string>('DB_USERNAME'),
          password: String(config.get<string>('DB_PASSWORD')),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
          entities: [User, Post],
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),

    UserModule,
    AuthModule,
    PostModule,
    EmpresaModule,
    ContactModule,
    EmpleoModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService, StorageService],
})
export class AppModule {}
