import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectResponseDto } from './dto/project-response.dto';
import type { ProjectMultipartPayload } from './multipart.util';
import { ProjectStorageService } from './project-storage.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectStorage: ProjectStorageService,
  ) {}

  async findAll(search?: string): Promise<ProjectResponseDto[]> {
    const query = search?.trim();

    const projects = await this.prisma.project.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
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

  async create(payload: ProjectMultipartPayload): Promise<ProjectResponseDto> {
    if (!payload.name) {
      throw new BadRequestException('Название проекта обязательно');
    }

    const project = await this.prisma.project.create({
      data: {
        name: payload.name,
        description: payload.description,
        figmaId: payload.figmaId,
        figmaLink: payload.figmaLink,
      },
    });

    if (!payload.preview) {
      return this.toResponse(project);
    }

    const preview = this.projectStorage.savePreview(project.id, payload.preview);

    try {
      const updated = await this.prisma.project.update({
        where: { id: project.id },
        data: { preview },
      });

      return this.toResponse(updated);
    } catch (error) {
      this.projectStorage.deleteFile(preview);
      throw error;
    }
  }

  async update(
    id: number,
    payload: ProjectMultipartPayload,
  ): Promise<ProjectResponseDto> {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Проект не найден');
    }

    const hasFields =
      payload.name !== undefined ||
      payload.description !== undefined ||
      payload.figmaId !== undefined ||
      payload.figmaLink !== undefined ||
      payload.preview !== undefined;

    if (!hasFields) {
      throw new BadRequestException('Нужно передать хотя бы одно поле для обновления');
    }

    if (payload.name !== undefined && !payload.name) {
      throw new BadRequestException('Название проекта не может быть пустым');
    }

    let preview = existing.preview;
    let previousPreview: string | null | undefined;

    if (payload.preview) {
      previousPreview = existing.preview;
      preview = this.projectStorage.savePreview(id, payload.preview);
    }

    try {
      const project = await this.prisma.project.update({
        where: { id },
        data: {
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.description !== undefined
            ? { description: payload.description }
            : {}),
          ...(payload.figmaId !== undefined ? { figmaId: payload.figmaId } : {}),
          ...(payload.figmaLink !== undefined
            ? { figmaLink: payload.figmaLink }
            : {}),
          ...(payload.preview ? { preview } : {}),
        },
      });

      if (previousPreview && previousPreview !== preview) {
        this.projectStorage.deleteFile(previousPreview);
      }

      return this.toResponse(project);
    } catch (error) {
      if (previousPreview && preview && preview !== previousPreview) {
        this.projectStorage.deleteFile(preview);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const existing = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true, preview: true },
    });

    if (!existing) {
      throw new NotFoundException('Проект не найден');
    }

    await this.prisma.project.delete({ where: { id } });
    this.projectStorage.deleteFile(existing.preview);
  }

  private toResponse(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      figmaId: project.figmaId,
      figmaLink: project.figmaLink,
      preview: project.preview,
      lastModified: project.lastModified,
      createdAt: project.createdAt,
    };
  }
}
