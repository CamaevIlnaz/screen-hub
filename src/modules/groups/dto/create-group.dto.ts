import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Формы', description: 'Название группы' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    example: 'Экраны с формами ввода',
    description: 'Описание группы',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: '12:56',
    description: 'Идентификатор ноды в Figma',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  figmaId?: string;
}
