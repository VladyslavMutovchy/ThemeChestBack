//creator.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectModel as InjectMongoModel } from '@nestjs/mongoose';
import { Guide } from './creator.model';
import { KeyWords } from './schemas/keywords.schema';
import { Model } from 'mongoose';
import { CreateGuideDto } from './dto/creator.dto';
import { AddKeyWordsDto } from './dto/add-keywords.dto';

@Injectable()
export class CreatorService {
  private readonly logger = new Logger(CreatorService.name);

  constructor(
    @InjectModel(Guide) private guideRepository: typeof Guide,
    @InjectMongoModel('KeyWords') private keyWordsModel: Model<KeyWords>,
  ) {}

  async createGuide(createGuideDto: CreateGuideDto): Promise<Guide> {
    try {
      this.logger.log('createGuide вызван в CreatorService');
      const guide = await this.guideRepository.create(createGuideDto);
      this.logger.log(`Созданный гайд: ${JSON.stringify(guide)}`);
      return guide;
    } catch (error) {
      this.logger.error('Ошибка при создании гайда', error);
      throw error;
    }
  }
 async getGuidesData(userId: string): Promise<Guide[]> {
    try {
      return await this.guideRepository.findAll({
        where: { user_id: userId },
      });
    } catch (error) {
      this.logger.error('Ошибка при получении гайдов', error);
      throw error;
    }
  } 
 
  
 async updateGuideThemes(addKeyWordsDto: AddKeyWordsDto): Promise<void> {
    try {
      const existingKeywords = await this.keyWordsModel.findOne({ guide_id: addKeyWordsDto.guide_id });
  
      if (existingKeywords) {
        existingKeywords.themes = addKeyWordsDto.themes;
        await existingKeywords.save();
      } else {
        const keywords = new this.keyWordsModel({
          guide_id: addKeyWordsDto.guide_id,
          themes: addKeyWordsDto.themes,
        });
        await keywords.save();
      }
    } catch (error) {
      throw error;
    }
  }
  
  async getGuideThemes(guide_id: string): Promise<KeyWords> {
    try {
      const keywords = await this.keyWordsModel.findOne({ guide_id }).exec();
      return keywords;
    } catch (error) {
      throw error;
    }
  }
  
}
