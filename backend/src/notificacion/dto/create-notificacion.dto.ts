// backend/src/notificacion/dto/create-notificacion.dto.ts
import {
  IsInt,
  IsString,
  IsOptional,
  IsIn,
  MaxLength,
  IsObject,
} from 'class-validator';

const TIPOS_VALIDOS = [
  'resena_nueva',
  'resena_editada',
  'resena_eliminada',
];

export class CreateNotificacionDto {
  @IsInt({ message: 'El userId debe ser un número entero' })
  userId: number;

  @IsString()
  @IsIn(TIPOS_VALIDOS, {
    message: `El tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`,
  })
  tipo: string;

  @IsString()
  @MaxLength(200, { message: 'El título no puede superar 200 caracteres' })
  titulo: string;

  @IsString()
  @MaxLength(1000, { message: 'El mensaje no puede superar 1000 caracteres' })
  mensaje: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  enlace?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}