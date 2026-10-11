import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../auth/dto/error-response.dto';
import { GroupResponseDto } from './dto/group-response.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Получить группу по id' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор группы' })
  @ApiOkResponse({
    description: 'Группа',
    type: GroupResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Группа не найдена',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<GroupResponseDto> {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Обновить группу' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор группы' })
  @ApiOkResponse({
    description: 'Группа обновлена',
    type: GroupResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Ошибка валидации',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Группа не найдена',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGroupDto,
  ): Promise<GroupResponseDto> {
    return this.groupsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Удалить группу' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор группы' })
  @ApiNoContentResponse({ description: 'Группа удалена' })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Группа не найдена',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.groupsService.remove(id);
  }
}
