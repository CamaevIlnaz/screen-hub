import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSettingDto {
  @ApiProperty({
    example: 'app.theme',
    description: 'Ключ настройки',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  key!: string;

  @ApiProperty({ example: 'dark', description: 'Значение настройки' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  value!: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Доступна без авторизации',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}
