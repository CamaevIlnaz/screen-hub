import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SyncStatus } from '@prisma/client';

export class SectionResponseDto {
  @ApiProperty({ example: 1, description: 'Идентификатор раздела' })
  id!: number;

  @ApiProperty({ example: 1, description: 'Идентификатор проекта' })
  projectId!: number;

  @ApiProperty({ example: 'Авторизация', description: 'Название раздела' })
  name!: string;

  @ApiPropertyOptional({
    example: 'Экраны входа и регистрации',
    description: 'Описание раздела',
    nullable: true,
  })
  description!: string | null;

  @ApiPropertyOptional({
    example: '12:34',
    description: 'Идентификатор ноды в Figma',
    nullable: true,
  })
  figmaId!: string | null;

  @ApiPropertyOptional({
    example:
      'https://www.figma.com/design/AbCdEfGhIjKlMnOpQrStUv/Project?node-id=12-34',
    description: 'Ссылка на ноду в Figma',
    nullable: true,
  })
  figmaLink!: string | null;

  @ApiPropertyOptional({
    enum: SyncStatus,
    example: SyncStatus.success,
    description:
      'Статус последней синхронизации с Figma (null — ещё не синхронизировался)',
    nullable: true,
  })
  syncStatus!: SyncStatus | null;

  @ApiPropertyOptional({
    example: 'Фрейм «Экран входа» (3:111) не найден в Figma',
    description: 'Ошибки последней синхронизации с Figma',
    nullable: true,
  })
  syncError!: string | null;

  @ApiPropertyOptional({
    example: '2026-10-13T03:00:00.000Z',
    description: 'Дата последней синхронизации с Figma',
    nullable: true,
  })
  figmaSyncedAt!: Date | null;

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
