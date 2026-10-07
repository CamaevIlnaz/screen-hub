import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 401, description: 'HTTP-код ошибки' })
  statusCode!: number;

  @ApiProperty({
    description: 'Текст ошибки или список ошибок валидации',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'Неверный login или пароль',
  })
  message!: string | string[];

  @ApiPropertyOptional({ example: 'Unauthorized', description: 'Тип ошибки' })
  error?: string;
}
