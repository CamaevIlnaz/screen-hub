import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FrameResponseDto {
  @ApiProperty({ example: 1, description: 'Идентификатор фрейма' })
  id!: number;

  @ApiProperty({ example: 1, description: 'Идентификатор группы' })
  groupId!: number;

  @ApiProperty({ example: 'Экран входа', description: 'Название фрейма' })
  name!: string;

  @ApiPropertyOptional({
    example: 'Форма авторизации',
    description: 'Описание фрейма',
    nullable: true,
  })
  description!: string | null;

  @ApiPropertyOptional({
    example: '12:78',
    description: 'Идентификатор ноды в Figma',
    nullable: true,
  })
  figmaId!: string | null;

  @ApiProperty({
    example: '2026-10-11T12:00:00.000Z',
    description: 'Дата создания',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-10-11T15:00:00.000Z',
    description: 'Дата последнего обновления',
  })
  updatedAt!: Date;
}
