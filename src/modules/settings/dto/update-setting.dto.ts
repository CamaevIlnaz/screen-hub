import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({ example: 'figd_...', description: 'Новое значение настройки' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  value!: string;
}
