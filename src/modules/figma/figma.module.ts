import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { VersionsModule } from '../versions/versions.module';
import { FigmaApiService } from './figma-api.service';
import { FigmaSyncScheduler } from './figma-sync.scheduler';
import { FigmaSyncService } from './figma-sync.service';
import { SectionFigmaSyncController } from './section-figma-sync.controller';

@Module({
  imports: [SettingsModule, VersionsModule],
  controllers: [SectionFigmaSyncController],
  providers: [FigmaApiService, FigmaSyncService, FigmaSyncScheduler],
})
export class FigmaModule {}
