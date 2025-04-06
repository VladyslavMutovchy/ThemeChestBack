import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectModel as InjectMongoModel } from '@nestjs/mongoose';
import { Guide } from './creator.model';
import { KeyWords } from './schemas/keywords.schema';
import { Model } from 'mongoose';
import { CreateGuideDto } from './dto/creator.dto';
import { AddKeyWordsDto } from './dto/add-keywords.dto';
import { Chapters } from './schemas/chapters.schema';
import { ChaptersDto } from './dto/chapters.dto';
import { KEYWORDS } from './constants/keywords';
import { AiGuideService } from './ai-guide.service';

@Injectable()
export class CreatorService {
  private readonly logger = new Logger(CreatorService.name);

  constructor(
    @InjectModel(Guide) private guideRepository: typeof Guide,
    @InjectMongoModel('KeyWords') private keyWordsModel: Model<KeyWords>,
    @InjectMongoModel('Chapters') private ChaptersModel: Model<Chapters>,
    private aiGuideService: AiGuideService,
  ) {}

  async createGuide(createGuideDto: CreateGuideDto): Promise<Guide> {
    try {
      const guide = await this.guideRepository.create(createGuideDto);
      return guide;
    } catch (error) {
      this.logger.error('Ошибка при создании гайда', error);
      throw error;
    }
  }

  async getGuideById(id: number): Promise<Guide> {
    try {
      const guide = await this.guideRepository.findByPk(id);
      if (!guide) {
        throw new Error(`Guide с ID ${id} не найден`);
      }
      return guide;
    } catch (error) {
      this.logger.error('Ошибка при получении гайда', error);
      throw error;
    }
  }

  async updatePreviewGuide(
    id: number,
    createGuideDto: Partial<CreateGuideDto>,
  ): Promise<Guide> {
    try {
      const guide = await this.guideRepository.findByPk(id);
      if (!guide) {
        throw new Error(`Guide с ID ${id} не найден`);
      }
      if (createGuideDto.title) {
        guide.title = createGuideDto.title;
      }
      if (createGuideDto.description) {
        guide.description = createGuideDto.description;
      }
      if (createGuideDto.prev_img) {
        guide.prev_img = createGuideDto.prev_img;
      }
      await guide.save();
      return guide;
    } catch (error) {
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
    const { guide_id, themes } = addKeyWordsDto;
    const themeIds = themes.map((theme) => {
      const id = Object.keys(KEYWORDS).find(
        (key) => KEYWORDS[Number(key)] === theme,
      );
      return Number(id);
    });
    await this.keyWordsModel.updateOne(
      { guide_id },
      {
        guide_id,
        themes: themeIds,
      },
      { upsert: true },
    );
  }

  async getGuideThemes(guide_id: string): Promise<any> {
    try {
      const keywords = await this.keyWordsModel.findOne({ guide_id }).exec();
      if (!keywords) {
        return {
          guide_id,
          themes: [],
        };
      }
      const themes = keywords.themes.map((themeId) => KEYWORDS[themeId]);
      return {
        guide_id: keywords.guide_id,
        themes,
      };
    } catch (error) {
      this.logger.error(
        `Ошибка при получении тем для guide_id: ${guide_id}`,
        error,
      );
      throw error;
    }
  }

  async generateAiGuide(options: {
    theme: string;
    difficulty: number;
    chapters: number;
    detailLevel: number;
    video: boolean;
    userId: number;
  }): Promise<any> {
    try {
      return await this.aiGuideService.generateAiGuide(options);
    } catch (error) {
      this.logger.error('Ошибка при генерации гайда:', error.message);
      throw error;
    }
  }

  async saveGeneratedGuide(guideData: any, userId: number): Promise<any> {
    const createGuideDto = {
      title: guideData.title,
      user_id: userId,
      description: guideData.description,
      prev_img: guideData.prev_img,
    };
    const savedGuide = await this.createGuide(createGuideDto);
    const chaptersDto = {
      guide_id: savedGuide.id,
      chapters: guideData.chapters,
    };
    await this.updateGuideChapters(chaptersDto);
    return savedGuide;
  }

  async updateGuideChapters(ChaptersDto: ChaptersDto): Promise<void> {
    try {
      const existingChapters = await this.ChaptersModel.findOne({
        guide_id: ChaptersDto.guide_id,
      });
      if (existingChapters) {
        existingChapters.chapters = ChaptersDto.chapters;
        await existingChapters.save();
      } else {
        const chapters = new this.ChaptersModel({
          guide_id: ChaptersDto.guide_id,
          chapters: ChaptersDto.chapters,
        });
        await chapters.save();
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteGuideChapters(guideId: number): Promise<void> {
    try {
      await this.ChaptersModel.deleteMany({ guide_id: guideId });
    } catch (error) {
      this.logger.error(
        `Ошибка при удалении глав для guide_id ${guideId}:`,
        error,
      );
      throw error;
    }
  }

  async deleteGuideThemes(guideId: number): Promise<void> {
    try {
      await this.keyWordsModel.deleteMany({ guide_id: guideId });
    } catch (error) {
      this.logger.error(
        `Ошибка при удалении тем для guide_id ${guideId}:`,
        error,
      );
      throw error;
    }
  }

  async deleteGuide(guideId: number): Promise<void> {
    try {
      await this.guideRepository.destroy({ where: { id: guideId } });
    } catch (error) {
      this.logger.error(`Ошибка при удалении гайда с ID ${guideId}:`, error);
      throw error;
    }
  }

  async getGuideChapters(guide_id: string): Promise<Chapters> {
    try {
      const chapters = await this.ChaptersModel.findOne({ guide_id }).exec();
      return chapters;
    } catch (error) {
      throw error;
    }
  }
}
