import { ApiPropertyOptional } from '@nestjs/swagger';

/** DTO только для Swagger (multipart/form-data). */
export class UpdateVersionDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Новый файл макета (png, jpg, webp, svg)',
  })
  file?: unknown;

  @ApiPropertyOptional({
    example: 'Обновлены отступы',
    description: 'Описание версии',
  })
  description?: string;
}
