import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { FigmaSyncService } from './figma-sync.service';

const TIMEOUT_NAME = 'figma-sync';

@Injectable()
export class FigmaSyncScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FigmaSyncScheduler.name);
  private readonly enabled: boolean;
  private readonly hours: number;
  private readonly minutes: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly figmaSyncService: FigmaSyncService,
  ) {
    this.enabled =
      this.configService.get<boolean>('figma.syncEnabled') === true;
    const syncTime = this.configService.getOrThrow<string>('figma.syncTime');
    [this.hours, this.minutes] = syncTime.split(':').map(Number);
  }

  onModuleInit(): void {
    if (!this.enabled) {
      this.logger.log('Автоматическая синхронизация с Figma отключена');
      return;
    }
    this.scheduleNext();
  }

  onModuleDestroy(): void {
    this.clear();
  }

  private scheduleNext(): void {
    this.clear();

    const now = new Date();
    const next = new Date(now);
    next.setHours(this.hours, this.minutes, 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    const timeout = setTimeout(() => {
      void this.run();
    }, next.getTime() - now.getTime());
    this.schedulerRegistry.addTimeout(TIMEOUT_NAME, timeout);

    this.logger.log(`Следующая синхронизация с Figma: ${next.toString()}`);
  }

  private async run(): Promise<void> {
    this.logger.log('Запуск ночной синхронизации с Figma');

    try {
      await this.figmaSyncService.syncAll();
    } catch (error) {
      this.logger.error(
        `Ночная синхронизация завершилась с ошибкой: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      this.scheduleNext();
    }
  }

  private clear(): void {
    if (this.schedulerRegistry.doesExist('timeout', TIMEOUT_NAME)) {
      this.schedulerRegistry.deleteTimeout(TIMEOUT_NAME);
    }
  }
}
