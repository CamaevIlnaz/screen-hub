import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Логин' })
  @IsString()
  @IsNotEmpty()
  login!: string;

  @ApiProperty({ example: 'password', description: 'Пароль' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
