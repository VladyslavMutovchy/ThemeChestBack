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

  async addKeyWords(addKeyWordsDto: AddKeyWordsDto): Promise<void> {
    try {
      this.logger.log('addKeyWords вызван в CreatorService');
      const keywords = new this.keyWordsModel({
        guide_id: addKeyWordsDto.guide_id,
        key_words: addKeyWordsDto.key_words,
      });
      await keywords.save();
      this.logger.log('Ключевые слова успешно добавлены');
    } catch (error) {
      this.logger.error('Ошибка при добавлении ключевых слов', error);
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
}
