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
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
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
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список проектов' })
  @ApiOkResponse({
    description: 'Список проектов',
    type: [ProjectResponseDto],
  })
  findAll(): Promise<ProjectResponseDto[]> {
    return this.projectsService.findAll();
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
  create(@Body() dto: CreateProjectDto): Promise<ProjectResponseDto> {
    return this.projectsService.create(dto);
  }

  @Patch(':id')
  @ApiCookieAuth()
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.update(id, dto);
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
