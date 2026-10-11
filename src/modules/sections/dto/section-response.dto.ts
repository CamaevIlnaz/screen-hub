import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
