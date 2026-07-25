// backend/src/resena/dto/update-resena.dto.ts
import {
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateResenaDto {
  @IsOptional()
  @IsInt({ message: 'La calificación debe ser un número entero' })
  @Min(1, { message: 'La calificación mínima es 1 estrella' })
  @Max(5, { message: 'La calificación máxima es 5 estrellas' })
  rating?: number;

  @IsOptional()
  @IsString({ message: 'El comentario debe ser texto' })
  @MinLength(10, {
    message: 'El comentario debe tener al menos 10 caracteres',
  })
  @MaxLength(1000, {
    message: 'El comentario no puede superar los 1000 caracteres',
  })
  comentario?: string;
}