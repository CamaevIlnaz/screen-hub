import { Module } from '@nestjs/common';
import { ProjectSectionsController } from './project-sections.controller';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';

@Module({
  controllers: [ProjectSectionsController, SectionsController],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}
