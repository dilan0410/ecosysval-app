// backend/src/user/dto/create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  // ==========================================
  // DATOS DEL USUARIO
  // ==========================================

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Perez',
  })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico único',
    example: 'juan@ejemplo.com',
  })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiProperty({
    description: 'Contraseña (mínimo 6 caracteres)',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  // ==========================================
  // DATOS DE LA EMPRESA (opcionales)
  // Se crean junto con el usuario
  // ==========================================

  @ApiPropertyOptional({
    description: 'Razón social de la empresa',
    example: 'Mi Empresa S.A. de C.V.',
  })
  @IsOptional()
  @IsString()
  razonSocial?: string;

  @ApiPropertyOptional({
    description: 'Representante legal de la empresa',
    example: 'Juan Perez',
  })
  @IsOptional()
  @IsString()
  representante?: string;

  @ApiPropertyOptional({
    description: 'Ubicación de la empresa',
    example: 'CDMX, México',
  })
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @ApiPropertyOptional({
    description: 'Página web de la empresa',
    example: 'https://miempresa.com',
  })
  @IsOptional()
  @IsString()
  paginaWeb?: string;

  @ApiPropertyOptional({
    description: 'Paquete de suscripción',
    example: 'basico',
    enum: ['basico', 'pro', 'premium', 'platino'],
  })
  @IsOptional()
  @IsString()
  paquete?: string;
}