// backend/src/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { EmpresaModule } from '../empresa/empresa.module';
import { StorageModule } from '../common/storage/storage.module';
import { MailerModule } from '../mailer/mailer.module'; // NUEVO

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmpresaModule,
    StorageModule,
    MailerModule, // NUEVO
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}