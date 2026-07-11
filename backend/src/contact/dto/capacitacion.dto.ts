// backend/src/contact/dto/capacitacion.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CapacitacionDto {
  @ApiProperty({
    description: 'Nombre del solicitante',
    example: 'Dilan',
  })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del solicitante',
    example: 'Carvajal',
  })
  @IsString({ message: 'El apellido debe ser texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede superar los 50 caracteres' })
  apellido: string;

  @ApiProperty({
    description: 'Correo electrónico',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiProperty({
    description: 'Estado o ubicación',
    example: 'CDMX',
  })
  @IsString({ message: 'El estado debe ser texto' })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  estado: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '3186403978',
  })
  @IsString({ message: 'El teléfono debe ser texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MinLength(7, { message: 'El teléfono debe tener al menos 7 dígitos' })
  @MaxLength(20, { message: 'El teléfono no puede superar los 20 caracteres' })
  telefono: string;

  @ApiPropertyOptional({
    description: 'Nombre de la empresa',
    example: 'Ecosysval',
  })
  @IsOptional()
  @IsString({ message: 'La empresa debe ser texto' })
  @MaxLength(100, { message: 'La empresa no puede superar los 100 caracteres' })
  empresa?: string;

  @ApiPropertyOptional({
    description: 'Cargo del solicitante',
    example: 'Director',
  })
  @IsOptional()
  @IsString({ message: 'El cargo debe ser texto' })
  @MaxLength(100, { message: 'El cargo no puede superar los 100 caracteres' })
  cargo?: string;

  @ApiProperty({
    description: 'Tipo de interés',
    example: 'Capacitación',
    enum: ['Capacitación', 'Curso', 'Diplomado', 'Asesoría'],
  })
  @IsString({ message: 'El interés debe ser texto' })
  @IsNotEmpty({ message: 'El interés es obligatorio' })
  interes: string;

  @ApiPropertyOptional({
    description: 'Mensaje adicional',
    example: 'Necesito más información sobre los cursos',
  })
  @IsOptional()
  @IsString({ message: 'El mensaje debe ser texto' })
  @MaxLength(1000, { message: 'El mensaje no puede superar los 1000 caracteres' })
  mensaje?: string;
}