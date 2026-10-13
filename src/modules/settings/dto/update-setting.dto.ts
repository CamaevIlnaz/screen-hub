import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateSettingDto {
  @ApiPropertyOptional({
    example: 'dark',
    description: 'Новое значение настройки',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  value?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Доступна без авторизации',
  })
  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}
