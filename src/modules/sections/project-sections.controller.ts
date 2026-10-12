import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../auth/dto/error-response.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { SectionResponseDto } from './dto/section-response.dto';
import { SectionsService } from './sections.service';

@ApiTags('sections')
@Controller('projects/:projectId/sections')
export class ProjectSectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список разделов проекта' })
  @ApiParam({
    name: 'projectId',
    type: Number,
    description: 'Идентификатор проекта',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поиск по названию и описанию',
  })
  @ApiOkResponse({
    description: 'Список разделов проекта',
    type: [SectionResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Проект не найден',
    type: ErrorResponseDto,
  })
  findAll(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('search') search?: string,
  ): Promise<SectionResponseDto[]> {
    return this.sectionsService.findAllByProject(projectId, search);
  }

  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Создать раздел в проекте' })
  @ApiParam({
    name: 'projectId',
    type: Number,
    description: 'Идентификатор проекта',
  })
  @ApiCreatedResponse({
    description: 'Раздел создан',
    type: SectionResponseDto,
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
    description: 'Проект не найден',
    type: ErrorResponseDto,
  })
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateSectionDto,
  ): Promise<SectionResponseDto> {
    return this.sectionsService.create(projectId, dto);
  }
}
