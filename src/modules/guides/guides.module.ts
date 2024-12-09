import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MongooseModule } from '@nestjs/mongoose'; 
import { GuidesService } from './guides.service';
import { GuidesController } from './guides.controller';
import { Guide } from '../creator/creator.model';
import { CreatorModule } from '../creator/creator.module';
import { FavoriteGuides } from './guides.model';
import { FavoriteSchema } from './schemas/guides.schema'; 

@Module({
  imports: [
    SequelizeModule.forFeature([Guide, FavoriteGuides]), 
    MongooseModule.forFeature([{ name: 'FavoriteGuides', schema: FavoriteSchema }]), 
    CreatorModule,
  ],
  controllers: [GuidesController],
  providers: [GuidesService],
})
export class GuidesModule {}
