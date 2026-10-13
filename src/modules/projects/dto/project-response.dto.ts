import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Идентификатор проекта',
  })
  id!: number;

  @ApiProperty({ example: 'Мобильное приложение', description: 'Название проекта' })
  name!: string;

  @ApiPropertyOptional({
    example: 'Дизайн-макеты основного приложения',
    description: 'Описание проекта',
    nullable: true,
  })
  description!: string | null;

  @ApiPropertyOptional({
    example: 'AbCdEfGhIjKlMnOpQrStUv',
    description: 'Идентификатор файла в Figma',
    nullable: true,
  })
  figmaId!: string | null;

  @ApiPropertyOptional({
    example: 'https://www.figma.com/design/AbCdEfGhIjKlMnOpQrStUv/Project',
    description: 'Ссылка на файл в Figma',
    nullable: true,
  })
  figmaLink!: string | null;

  @ApiPropertyOptional({
    example: 'projects/1/preview.png',
    description: 'Путь к файлу превью относительно uploads (URL: /uploads/{preview})',
    nullable: true,
  })
  preview!: string | null;

  @ApiProperty({
    example: '2026-10-11T15:00:00.000Z',
    description: 'Дата последнего изменения',
  })
  lastModified!: Date;

  @ApiProperty({
    example: '2026-10-11T12:00:00.000Z',
    description: 'Дата создания',
  })
  createdAt!: Date;
}
