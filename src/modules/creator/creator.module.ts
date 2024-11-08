//creator.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MongooseModule } from '@nestjs/mongoose';
import { CreatorController } from './creator.controller';
import { CreatorService } from './creator.service';
import { Guide } from './creator.model';
import { KeyWords, KeyWordsSchema } from './schemas/keywords.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Guide]),
    MongooseModule.forFeature([{ name: KeyWords.name, schema: KeyWordsSchema }]),
    AuthModule,
  ],
  controllers: [CreatorController],
  providers: [CreatorService],
})
export class CreatorModule {}