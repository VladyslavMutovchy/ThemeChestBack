//creator.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MongooseModule } from '@nestjs/mongoose';
import { CreatorController } from './creator.controller';
import { CreatorService } from './creator.service';
import { AiGuideService } from './ai-guide.service';
import { Guide } from './creator.model';
import { KeyWords, KeyWordsSchema } from './schemas/keywords.schema';
import { AuthModule } from '../auth/auth.module';
import { Chapters, ChaptersSchema } from './schemas/chapters.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [

    SequelizeModule.forFeature([Guide]),
    MongooseModule.forFeature([
      { name: KeyWords.name, schema: KeyWordsSchema },
      { name: Chapters.name, schema: ChaptersSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [CreatorController],
  providers: [CreatorService, AiGuideService],
  exports: [
    CreatorService,
    AiGuideService,
    SequelizeModule,
    MongooseModule,
  ],
})
export class CreatorModule {}
