import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GroupResponseDto {
  @ApiProperty({ example: 1, description: 'Идентификатор группы' })
  id!: number;

  @ApiProperty({ example: 1, description: 'Идентификатор раздела' })
  sectionId!: number;

  @ApiProperty({ example: 'Формы', description: 'Название группы' })
  name!: string;

  @ApiPropertyOptional({
    example: 'Экраны с формами ввода',
    description: 'Описание группы',
    nullable: true,
  })
  description!: string | null;

  @ApiPropertyOptional({
    example: '12:56',
    description: 'Идентификатор ноды в Figma',
    nullable: true,
  })
  figmaId!: string | null;

  @ApiProperty({
    example: '2026-10-11T12:00:00.000Z',
    description: 'Дата создания',
  })
  createdAt!: Date;
}
