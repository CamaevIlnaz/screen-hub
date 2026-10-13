import { ApiProperty } from '@nestjs/swagger';

export class FigmaSyncResultDto {
  @ApiProperty({ example: 1, description: 'Идентификатор раздела' })
  sectionId!: number;

  @ApiProperty({
    example: false,
    description: 'Синхронизация пропущена: файл в Figma не менялся',
  })
  skipped!: boolean;

  @ApiProperty({ example: 1, description: 'Создано групп' })
  groupsCreated!: number;

  @ApiProperty({ example: 3, description: 'Создано фреймов' })
  framesCreated!: number;

  @ApiProperty({ example: 4, description: 'Создано новых версий' })
  versionsCreated!: number;

  @ApiProperty({ example: 10, description: 'Фреймов без изменений' })
  unchanged!: number;

  @ApiProperty({
    example: ['Фрейм «Экран входа» (3:111) не найден в Figma'],
    description: 'Ошибки синхронизации',
    type: [String],
  })
  errors!: string[];
}
