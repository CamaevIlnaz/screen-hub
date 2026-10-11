import { Module } from '@nestjs/common';
import { FrameVersionsController } from './frame-versions.controller';
import { VersionStorageService } from './version-storage.service';
import { VersionsController } from './versions.controller';
import { VersionsService } from './versions.service';

@Module({
  controllers: [FrameVersionsController, VersionsController],
  providers: [VersionsService, VersionStorageService],
  exports: [VersionsService],
})
export class VersionsModule {}
