import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'Идентификатор пользователя' })
  id!: number;

  @ApiProperty({ example: 'admin', description: 'Логин' })
  login!: string;

  @ApiProperty({ example: 'Админ', description: 'Имя' })
  name!: string;

  @ApiProperty({ enum: Role, example: Role.admin, description: 'Роль' })
  role!: Role;
}
