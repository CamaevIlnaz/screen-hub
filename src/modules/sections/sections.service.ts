import { Injectable, NotFoundException } from '@nestjs/common';
import { Section } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { SectionResponseDto } from './dto/section-response.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByProject(projectId: number): Promise<SectionResponseDto[]> {
    await this.ensureProjectExists(projectId);

    const sections = await this.prisma.section.findMany({
      where: { projectId },
      orderBy: { lastModified: 'desc' },
    });

    return sections.map((section) => this.toResponse(section));
  }

  async findOne(id: number): Promise<SectionResponseDto> {
    const section = await this.prisma.section.findUnique({ where: { id } });
    if (!section) {
      throw new NotFoundException('Раздел не найден');
    }

    return this.toResponse(section);
  }

  async create(
    projectId: number,
    dto: CreateSectionDto,
  ): Promise<SectionResponseDto> {
    await this.ensureProjectExists(projectId);

    const section = await this.prisma.section.create({
      data: {
        projectId,
        name: dto.name,
        description: dto.description,
        figmaId: dto.figmaId,
      },
    });

    return this.toResponse(section);
  }

  async update(id: number, dto: UpdateSectionDto): Promise<SectionResponseDto> {
    await this.ensureExists(id);

    const section = await this.prisma.section.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        figmaId: dto.figmaId,
      },
    });

    return this.toResponse(section);
  }

  async remove(id: number): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.section.delete({ where: { id } });
  }

  private async ensureExists(id: number): Promise<void> {
    const section = await this.prisma.section.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!section) {
      throw new NotFoundException('Раздел не найден');
    }
  }

  private async ensureProjectExists(projectId: number): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }
  }

  private toResponse(section: Section): SectionResponseDto {
    return {
      id: section.id,
      projectId: section.projectId,
      name: section.name,
      description: section.description,
      figmaId: section.figmaId,
      lastModified: section.lastModified,
      createdAt: section.createdAt,
    };
  }
}
