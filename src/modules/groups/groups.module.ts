import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { SectionGroupsController } from './section-groups.controller';

@Module({
  controllers: [SectionGroupsController, GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
