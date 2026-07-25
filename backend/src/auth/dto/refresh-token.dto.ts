// backend/src/auth/dto/refresh-token.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token recibido en el login',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString({ message: 'El refresh_token debe ser texto' })
  @IsNotEmpty({ message: 'El refresh_token es obligatorio' })
  refresh_token: string;
}