import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFrameDto {
  @ApiProperty({ example: 'Экран входа', description: 'Название фрейма' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    example: 'Форма авторизации',
    description: 'Описание фрейма',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: '12:78',
    description: 'Идентификатор ноды в Figma',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  figmaId?: string;
}
