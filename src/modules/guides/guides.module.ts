import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GuidesService } from './guides.service';
import { GuidesController } from './guides.controller';
import { Guide } from '../creator/creator.model';
import { CreatorModule } from '../creator/creator.module';
@Module({
  imports: [
    SequelizeModule.forFeature([Guide]),
    CreatorModule,
  ],
  controllers: [GuidesController],
  providers: [GuidesService],
})
export class GuidesModule {}
