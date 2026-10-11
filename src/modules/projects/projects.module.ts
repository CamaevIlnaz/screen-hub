import { Module } from '@nestjs/common';
import { ProjectStorageService } from './project-storage.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectStorageService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
