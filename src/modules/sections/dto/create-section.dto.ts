import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ example: 'Авторизация', description: 'Название раздела' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    example: 'Экраны входа и регистрации',
    description: 'Описание раздела',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: '12:34',
    description: 'Идентификатор ноды в Figma',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  figmaId?: string;
}
