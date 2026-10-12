import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UploadType } from '@prisma/client';

export class VersionResponseDto {
  @ApiProperty({ example: 1, description: 'Идентификатор версии' })
  id!: number;

  @ApiProperty({ example: 1, description: 'Идентификатор фрейма' })
  frameId!: number;

  @ApiProperty({ example: 1, description: 'Номер версии внутри фрейма' })
  version!: number;

  @ApiPropertyOptional({
    example: 'Обновлены отступы',
    description: 'Описание версии',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    example: 'frames/1/versions/1.png',
    description: 'Путь к файлу относительно uploads (URL: /uploads/{filename})',
  })
  filename!: string;

  @ApiProperty({
    enum: UploadType,
    example: UploadType.manual,
    description: 'Тип загрузки: ручная или автоматическая',
  })
  uploadType!: UploadType;

  @ApiProperty({
    example: '2026-10-11T12:00:00.000Z',
    description: 'Дата создания',
  })
  createdAt!: Date;
}
