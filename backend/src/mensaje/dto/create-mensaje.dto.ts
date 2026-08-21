// backend/src/mensaje/dto/create-mensaje.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateConversacionDto {
  @ApiProperty({ example: 2, description: 'ID del usuario con el que quieres chatear' })
  @IsInt()
  @Min(1)
  participanteId: number;

  @ApiProperty({
    example: 'Hola, vi tu empresa y me gustaría conectar.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  mensajeInicial?: string;
}

export class CreateMensajeDto {
  @ApiProperty({ example: 'Me interesa una alianza comercial.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  contenido: string;
}