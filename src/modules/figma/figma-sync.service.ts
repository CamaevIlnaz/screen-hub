import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncStatus } from '@prisma/client';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { VersionsService } from '../versions/versions.service';
import { FigmaSyncResultDto } from './dto/figma-sync-result.dto';
import { FigmaApiError, FigmaApiService, FigmaNode } from './figma-api.service';

const EXPORT_BATCH_SIZE = 50;

type SyncOptions = {
  skipUnchanged?: boolean;
};

type SyncTarget = {
  id: number;
  figmaId: string;
  syncStatus: SyncStatus | null;
  figmaSyncedAt: Date | null;
  fileKey: string;
  token: string;
};

type FrameToExport = {
  id: number;
  figmaId: string;
  name: string;
};

@Injectable()
export class FigmaSyncService implements OnModuleInit {
  private readonly logger = new Logger(FigmaSyncService.name);
  private readonly runningSections = new Set<number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly figmaApi: FigmaApiService,
    private readonly versionsService: VersionsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.prisma.section.updateMany({
      where: { syncStatus: SyncStatus.in_progress },
      data: {
        syncStatus: SyncStatus.error,
        syncError: 'Синхронизация прервана перезапуском приложения',
      },
    });
  }

  async syncSection(
    sectionId: number,
    options: SyncOptions = {},
  ): Promise<FigmaSyncResultDto> {
    const target = await this.resolveTarget(sectionId);

    if (this.runningSections.has(sectionId)) {
      throw new ConflictException('Синхронизация раздела уже выполняется');
    }

    this.runningSections.add(sectionId);
    try {
      return await this.runSync(target, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Раздел #${sectionId}: ${message}`);

      await this.prisma.section.update({
        where: { id: sectionId },
        data: {
          syncStatus: SyncStatus.error,
          syncError:
            error instanceof FigmaApiError
              ? message
              : 'Внутренняя ошибка синхронизации',
        },
      });

      if (error instanceof FigmaApiError) {
        throw new BadGatewayException(`Ошибка Figma: ${message}`);
      }
      throw error;
    } finally {
      this.runningSections.delete(sectionId);
    }
  }

  async syncAll(): Promise<void> {
    const token = await this.getToken();
    if (!token) {
      this.logger.warn(
        'Токен Figma не найден в настройках, синхронизация пропущена',
      );
      return;
    }

    const sections = await this.prisma.section.findMany({
      where: { figmaId: { not: null }, project: { figmaId: { not: null } } },
      select: { id: true },
      orderBy: { id: 'asc' },
    });

    this.logger.log(`Синхронизация разделов: ${sections.length}`);

    for (const section of sections) {
      try {
        const result = await this.syncSection(section.id, {
          skipUnchanged: true,
        });
        this.logger.log(
          `Раздел #${section.id}: ${
            result.skipped
              ? 'без изменений'
              : `групп +${result.groupsCreated}, фреймов +${result.framesCreated}, версий +${result.versionsCreated}, ошибок ${result.errors.length}`
          }`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Раздел #${section.id} не синхронизирован: ${message}`,
        );
      }
    }
  }

  private async resolveTarget(sectionId: number): Promise<SyncTarget> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: { project: { select: { figmaId: true } } },
    });

    if (!section) {
      throw new NotFoundException('Раздел не найден');
    }
    if (!section.figmaId) {
      throw new BadRequestException('У раздела не указан figmaId');
    }
    if (!section.project.figmaId) {
      throw new BadRequestException('У проекта не указан figmaId');
    }

    const token = await this.getToken();
    if (!token) {
      throw new BadRequestException(
        'Токен Figma не найден в настройках',
      );
    }

    return {
      id: section.id,
      figmaId: this.normalizeNodeId(section.figmaId),
      syncStatus: section.syncStatus,
      figmaSyncedAt: section.figmaSyncedAt,
      fileKey: section.project.figmaId,
      token,
    };
  }

  private async getToken(): Promise<string | undefined> {
    const key = this.configService.getOrThrow<string>('figma.tokenSettingKey');
    const token = await this.settingsService.get(key);
    return token?.trim() || undefined;
  }

  private async runSync(
    target: SyncTarget,
    options: SyncOptions,
  ): Promise<FigmaSyncResultDto> {
    const result: FigmaSyncResultDto = {
      sectionId: target.id,
      skipped: false,
      groupsCreated: 0,
      framesCreated: 0,
      versionsCreated: 0,
      unchanged: 0,
      errors: [],
    };

    const tree = await this.figmaApi.getNodeTree(
      target.token,
      target.fileKey,
      target.figmaId,
    );

    if (
      options.skipUnchanged &&
      target.syncStatus === SyncStatus.success &&
      target.figmaSyncedAt &&
      tree.lastModified <= target.figmaSyncedAt
    ) {
      return { ...result, skipped: true };
    }

    await this.prisma.section.update({
      where: { id: target.id },
      data: { syncStatus: SyncStatus.in_progress },
    });

    const frames = await this.syncStructure(target.id, tree.node, result);
    await this.syncVersions(target, frames, tree.lastModified, result);

    const hasErrors = result.errors.length > 0;
    await this.prisma.section.update({
      where: { id: target.id },
      data: {
        syncStatus: hasErrors ? SyncStatus.error : SyncStatus.success,
        syncError: hasErrors ? result.errors.join('\n') : null,
        figmaSyncedAt: new Date(),
      },
    });

    return result;
  }

  private async syncStructure(
    sectionId: number,
    sectionNode: FigmaNode,
    result: FigmaSyncResultDto,
  ): Promise<FrameToExport[]> {
    const groups = await this.prisma.group.findMany({
      where: { sectionId, figmaId: { not: null } },
      select: { id: true, figmaId: true, name: true },
    });
    const frames = await this.prisma.frame.findMany({
      where: { group: { sectionId }, figmaId: { not: null } },
      select: { id: true, figmaId: true, name: true, groupId: true },
    });

    const groupsByFigmaId = new Map(groups.map((item) => [item.figmaId, item]));
    const framesByFigmaId = new Map(frames.map((item) => [item.figmaId, item]));
    const seenGroups = new Set<string>();
    const seenFrames = new Set<string>();
    const framesToExport: FrameToExport[] = [];

    for (const groupNode of sectionNode.children ?? []) {
      seenGroups.add(groupNode.id);

      let group = groupsByFigmaId.get(groupNode.id);
      if (!group) {
        group = await this.prisma.group.create({
          data: { sectionId, figmaId: groupNode.id, name: groupNode.name },
          select: { id: true, figmaId: true, name: true },
        });
        result.groupsCreated += 1;
      } else if (group.name !== groupNode.name) {
        await this.prisma.group.update({
          where: { id: group.id },
          data: { name: groupNode.name },
        });
      }

      for (const frameNode of groupNode.children ?? []) {
        seenFrames.add(frameNode.id);

        let frame = framesByFigmaId.get(frameNode.id);
        if (!frame) {
          frame = await this.prisma.frame.create({
            data: {
              groupId: group.id,
              figmaId: frameNode.id,
              name: frameNode.name,
            },
            select: { id: true, figmaId: true, name: true, groupId: true },
          });
          result.framesCreated += 1;
        } else if (
          frame.name !== frameNode.name ||
          frame.groupId !== group.id
        ) {
          await this.prisma.frame.update({
            where: { id: frame.id },
            data: { name: frameNode.name, groupId: group.id },
          });
        }

        framesToExport.push({
          id: frame.id,
          figmaId: frameNode.id,
          name: frameNode.name,
        });
      }
    }

    for (const group of groups) {
      if (!seenGroups.has(group.figmaId!)) {
        result.errors.push(
          `Группа «${group.name}» (${group.figmaId}) не найдена в Figma`,
        );
      }
    }
    for (const frame of frames) {
      if (!seenFrames.has(frame.figmaId!)) {
        result.errors.push(
          `Фрейм «${frame.name}» (${frame.figmaId}) не найден в Figma`,
        );
      }
    }

    return framesToExport;
  }

  private async syncVersions(
    target: SyncTarget,
    frames: FrameToExport[],
    lastModified: Date,
    result: FigmaSyncResultDto,
  ): Promise<void> {
    for (let i = 0; i < frames.length; i += EXPORT_BATCH_SIZE) {
      const batch = frames.slice(i, i + EXPORT_BATCH_SIZE);

      let urls: Record<string, string | null>;
      try {
        urls = await this.figmaApi.getSvgUrls(
          target.token,
          target.fileKey,
          batch.map((frame) => frame.figmaId),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        for (const frame of batch) {
          result.errors.push(this.frameError(frame, message));
        }
        continue;
      }

      for (const frame of batch) {
        const url = urls[frame.figmaId];
        if (!url) {
          result.errors.push(this.frameError(frame, 'Figma не вернула SVG'));
          continue;
        }

        try {
          const created = await this.saveVersionIfChanged(
            frame,
            await this.figmaApi.download(url),
            lastModified,
          );
          if (created) {
            result.versionsCreated += 1;
          } else {
            result.unchanged += 1;
          }
        } catch (error) {
          const message =
            error instanceof FigmaApiError
              ? error.message
              : 'не удалось сохранить версию';
          this.logger.error(
            `Фрейм #${frame.id}: ${error instanceof Error ? error.message : String(error)}`,
          );
          result.errors.push(this.frameError(frame, message));
        }
      }
    }
  }

  private async saveVersionIfChanged(
    frame: FrameToExport,
    buffer: Buffer,
    lastModified: Date,
  ): Promise<boolean> {
    const contentHash = createHash('sha256').update(buffer).digest('hex');

    const latest = await this.prisma.version.findFirst({
      where: { frameId: frame.id },
      orderBy: { version: 'desc' },
      select: { contentHash: true },
    });

    if (latest?.contentHash === contentHash) {
      return false;
    }

    await this.versionsService.createAutomatic(
      frame.id,
      { buffer, filename: `${frame.figmaId}.svg`, mimetype: 'image/svg+xml' },
      contentHash,
      `Автозагрузка из Figma (изменено ${lastModified.toISOString()})`,
    );

    return true;
  }

  private frameError(frame: FrameToExport, message: string): string {
    return `Фрейм «${frame.name}» (${frame.figmaId}): ${message}`;
  }

  private normalizeNodeId(nodeId: string): string {
    return nodeId.trim().replace(/-/g, ':');
  }
}
