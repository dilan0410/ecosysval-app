// backend/src/auth/dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token único recibido por email',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString({ message: 'El token debe ser texto' })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token: string;

  @ApiProperty({
    description:
      'Nueva contraseña (mínimo 8 caracteres, con mayúscula, minúscula y símbolo)',
    example: 'MiNuevaPass123!',
    minLength: 8,
  })
  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  @MaxLength(100, {
    message: 'La contraseña no puede superar los 100 caracteres',
  })
  @Matches(/[A-Z]/, {
    message: 'La contraseña debe tener al menos una letra mayúscula',
  })
  @Matches(/[a-z]/, {
    message: 'La contraseña debe tener al menos una letra minúscula',
  })
  @Matches(/[0-9!@#$%^&*(),.?":{}|<>_\-+=]/, {
    message: 'La contraseña debe tener al menos un número o símbolo',
  })
  password: string;

  @ApiProperty({
    description: 'Confirmación de la nueva contraseña (debe coincidir)',
    example: 'MiNuevaPass123!',
  })
  @IsString({ message: 'La confirmación debe ser texto' })
  @IsNotEmpty({ message: 'La confirmación es obligatoria' })
  confirmPassword: string;
}