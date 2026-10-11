import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../auth/dto/error-response.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupResponseDto } from './dto/group-response.dto';
import { GroupsService } from './groups.service';

@ApiTags('groups')
@Controller('sections/:sectionId/groups')
export class SectionGroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список групп раздела' })
  @ApiParam({
    name: 'sectionId',
    type: Number,
    description: 'Идентификатор раздела',
  })
  @ApiOkResponse({
    description: 'Список групп раздела',
    type: [GroupResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Раздел не найден',
    type: ErrorResponseDto,
  })
  findAll(
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ): Promise<GroupResponseDto[]> {
    return this.groupsService.findAllBySection(sectionId);
  }

  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Создать группу в разделе' })
  @ApiParam({
    name: 'sectionId',
    type: Number,
    description: 'Идентификатор раздела',
  })
  @ApiCreatedResponse({
    description: 'Группа создана',
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
    description: 'Раздел не найден',
    type: ErrorResponseDto,
  })
  create(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    return this.groupsService.create(sectionId, dto);
  }
}
