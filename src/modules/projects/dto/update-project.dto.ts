import { ApiPropertyOptional } from '@nestjs/swagger';

/** DTO только для Swagger (multipart/form-data). */
export class UpdateProjectDto {
  @ApiPropertyOptional({
    example: 'Мобильное приложение',
    description: 'Название проекта',
  })
  name?: string;

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
    type: 'string',
    format: 'binary',
    description: 'Превью проекта (png, jpg, webp, svg)',
  })
  preview?: unknown;
}
