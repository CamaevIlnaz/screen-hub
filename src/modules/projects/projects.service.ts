import { Injectable, NotFoundException } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ProjectResponseDto[]> {
    const projects = await this.prisma.project.findMany({
      orderBy: { lastModified: 'desc' },
    });

    return projects.map((project) => this.toResponse(project));
  }

  async findOne(id: number): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    return this.toResponse(project);
  }

  async create(dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        figmaId: dto.figmaId,
        preview: dto.preview,
      },
    });

    return this.toResponse(project);
  }

  async update(id: number, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    await this.ensureExists(id);

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        figmaId: dto.figmaId,
        preview: dto.preview,
      },
    });

    return this.toResponse(project);
  }

  async remove(id: number): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.project.delete({ where: { id } });
  }

  private async ensureExists(id: number): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }
  }

  private toResponse(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      figmaId: project.figmaId,
      preview: project.preview,
      lastModified: project.lastModified,
      createdAt: project.createdAt,
    };
  }
}
