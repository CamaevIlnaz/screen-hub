import { Module } from '@nestjs/common';
import { FramesController } from './frames.controller';
import { FramesService } from './frames.service';
import { GroupFramesController } from './group-frames.controller';

@Module({
  controllers: [GroupFramesController, FramesController],
  providers: [FramesService],
  exports: [FramesService],
})
export class FramesModule {}
