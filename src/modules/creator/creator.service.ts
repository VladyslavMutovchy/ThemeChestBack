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
import { marked } from 'marked';
import axios from 'axios';

@Injectable()
export class CreatorService {
  private readonly logger = new Logger(CreatorService.name);

  constructor(
    @InjectModel(Guide) private guideRepository: typeof Guide,
    @InjectMongoModel('KeyWords') private keyWordsModel: Model<KeyWords>,
    @InjectMongoModel('Chapters') private ChaptersModel: Model<Chapters>,
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
  async getGuideById(id: number): Promise<Guide> {
    try {
      this.logger.log(`getGuideById вызван для guide_id: ${id}`);
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
    const { theme, difficulty, chapters, detailLevel } = options;
  
    try {
      // Формируем единый запрос с требуемым количеством глав
      const prompt = `
        Write a detailed step-by-step guide on the topic "${theme}".
        ALL text should be written in the language of the topic "${theme}"!
        The guide must contain exactly ${chapters || "any"} chapters.
        Each chapter should have a descriptive title and content.
        Provide the response in the following JSON format:
        {
          "title": "Guide Title",
          "chapters": [
            {
              "chapterTitle": "Title of Chapter 1",
              "content": "Content for Chapter 1"
            },
            {
              "chapterTitle": "Title of Chapter 2",
              "content": "Content for Chapter 2"
            },
            ...
          ]
        }
        Difficulty: ${['Beginner', 'Intermediate', 'Advanced', 'Expert'][difficulty - 1]}.
        Detail level: ${detailLevel}.
        Include step-by-step instructions, examples, and tips.
      `;
  
      // Отправляем запрос
      const response = await axios.post('http://localhost:5000/generate', {
        prompt,
      });
  
      if (!response.data.response) {
        console.error(`Python API response is empty.`);
        throw new Error(`Python API response is empty.`);
      }
  
      // Парсим JSON-ответ
      const guideData = JSON.parse(response.data.response);
  
      if (!guideData || !guideData.chapters || !Array.isArray(guideData.chapters)) {
        throw new Error('Invalid API response format. Expected JSON with chapters.');
      }
  
      // Сохраняем гайд и главы
      const createGuideDto = {
        title: guideData.title,
        user_id: options.userId,
        description: guideData.chapters[0]?.chapterTitle || '', // Описание берем из первой главы
        prev_img:
          'https://memepedia.ru/wp-content/uploads/2017/10/%D1%88%D0%B0%D0%B1%D0%BB%D0%BE%D0%BD-20.jpg',
      };
  
      const savedGuide = await this.createGuide(createGuideDto);
  
      // Сохраняем главы
      const chaptersDto = {
        guide_id: savedGuide.id,
        chapters: guideData.chapters.map((chapter) => ({
          chapterTitle: chapter.chapterTitle,
          contents: [
            {
              type: 'paragraph',
              value: marked(chapter.content), // Преобразование Markdown
            },
            {
              type: 'img',
              value:
                'https://memepedia.ru/wp-content/uploads/2017/10/%D1%88%D0%B0%D0%B1%D0%BB%D0%BE%D0%BD-20.jpg',
            },
          ],
        })),
      };
  
      await this.updateGuideChapters(chaptersDto);
  
      return savedGuide;
    } catch (error) {
      console.error('Error generating guide via Python API:', error.message);
      throw new Error('Failed to generate guide.');
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
    await this.ChaptersModel.deleteMany({ guide_id: guideId });
  }
  
  async deleteGuideThemes(guideId: number): Promise<void> {
    await this.keyWordsModel.deleteMany({ guide_id: guideId });
  }
  
  async deleteGuide(guideId: number): Promise<void> {
    await this.guideRepository.destroy({ where: { id: guideId } });
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
