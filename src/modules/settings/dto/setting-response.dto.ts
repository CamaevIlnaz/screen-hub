import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SettingResponseDto {
  @ApiProperty({ example: 'figma.token', description: 'Ключ настройки' })
  key!: string;

  @ApiPropertyOptional({
    example: 'figd_****LB29',
    description: 'Значение настройки (секретные значения маскируются)',
    nullable: true,
  })
  value!: string | null;

  @ApiPropertyOptional({
    example: '2026-10-13T07:00:00.000Z',
    description: 'Дата последнего изменения',
    nullable: true,
  })
  updatedAt!: Date | null;
}
