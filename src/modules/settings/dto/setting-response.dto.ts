import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SettingResponseDto {
  @ApiProperty({ example: 'app.theme', description: 'Ключ настройки' })
  key!: string;

  @ApiProperty({
    example: 'dark',
    description: 'Значение настройки',
  })
  value!: string;

  @ApiProperty({
    example: false,
    description: 'Доступна без авторизации',
  })
  publish!: boolean;

  @ApiPropertyOptional({
    example: '2026-10-13T07:00:00.000Z',
    description: 'Дата последнего изменения',
    nullable: true,
  })
  updatedAt!: Date | null;
}
