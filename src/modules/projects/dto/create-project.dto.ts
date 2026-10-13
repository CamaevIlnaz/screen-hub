import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** DTO только для Swagger (multipart/form-data). */
export class CreateProjectDto {
  @ApiProperty({ example: 'Мобильное приложение', description: 'Название проекта' })
  name!: string;

  @ApiPropertyOptional({
    example: 'Дизайн-макеты основного приложения',
    description: 'Описание проекта',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 'AbCdEfGhIjKlMnOpQrStUv',
    description: 'Идентификатор файла в Figma',
  })
  figmaId?: string;

  @ApiPropertyOptional({
    example: 'https://www.figma.com/design/AbCdEfGhIjKlMnOpQrStUv/Project',
    description: 'Ссылка на файл в Figma',
  })
  figmaLink?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Превью проекта (png, jpg, webp, svg)',
  })
  preview?: unknown;
}
