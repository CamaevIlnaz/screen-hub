import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** DTO только для Swagger (multipart/form-data). */
export class CreateVersionDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Файл макета (png, jpg, webp, svg)',
  })
  file!: unknown;

  @ApiPropertyOptional({
    example: 'Обновлены отступы',
    description: 'Описание версии',
  })
  description?: string;
}
