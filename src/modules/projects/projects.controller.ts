import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../auth/dto/error-response.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { parseProjectMultipart } from './multipart.util';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список проектов' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поиск по названию и описанию',
  })
  @ApiOkResponse({
    description: 'Список проектов',
    type: [ProjectResponseDto],
  })
  findAll(@Query('search') search?: string): Promise<ProjectResponseDto[]> {
    return this.projectsService.findAll(search);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Получить проект по id' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор проекта' })
  @ApiOkResponse({
    description: 'Проект',
    type: ProjectResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Проект не найден',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id);
  }

  @Post()
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProjectDto })
  @ApiOperation({ summary: 'Создать проект' })
  @ApiCreatedResponse({
    description: 'Проект создан',
    type: ProjectResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Ошибка валидации',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
    type: ErrorResponseDto,
  })
  async create(@Req() request: FastifyRequest): Promise<ProjectResponseDto> {
    const payload = await parseProjectMultipart(request);
    return this.projectsService.create(payload);
  }

  @Patch(':id')
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProjectDto })
  @ApiOperation({ summary: 'Обновить проект' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор проекта' })
  @ApiOkResponse({
    description: 'Проект обновлён',
    type: ProjectResponseDto,
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
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: FastifyRequest,
  ): Promise<ProjectResponseDto> {
    const payload = await parseProjectMultipart(request);
    return this.projectsService.update(id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Удалить проект' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор проекта' })
  @ApiNoContentResponse({ description: 'Проект удалён' })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Проект не найден',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projectsService.remove(id);
  }
}
