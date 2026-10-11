import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Мобильное приложение', description: 'Название проекта' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    example: 'Дизайн-макеты основного приложения',
    description: 'Описание проекта',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: 'AbCdEfGhIjKlMnOpQrStUv',
    description: 'Идентификатор файла в Figma',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  figmaId?: string;

  @ApiPropertyOptional({
    example: 'projects/1/preview.png',
    description: 'Путь к файлу превью относительно uploads',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  preview?: string;
}
