import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface Chapter {
  chapterTitle: string;
  content: string;
}

interface GuideData {
  title: string;
  description: string;
  chapters: Chapter[];
}

@Injectable()
export class AiGuideService {
  private readonly logger = new Logger(AiGuideService.name);

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
      const prompt = `
        Write a detailed step-by-step guide on the topic "${theme}".
        ALL text should be written in the language of the topic "${theme}"!
        The guide must contain exact  ${chapters || 'up to 6'} chapters.
        The "content" field in the response must be in valid HTML format (do not use:<h1>,<h2>) .
        Provide the response in the following format Only:
        {
          "title": "Guide Title",
          "description": "Proverb about title",
          "chapters": [
            {
              "chapterTitle": "chapter's title",
              "content": "Content for Chapter 1"
            },
            {
              "chapterTitle": "chapter's title",
              "content": "Content for Chapter 2"
            },
            ...
          ]
        }
        Difficulty: ${['Beginner', 'Intermediate', 'Advanced', 'Expert'][difficulty - 1]}.
        Detail level: ${detailLevel} (1 = ~300 words per "content", 6 = 1500+ words per "content").
        Include step-by-step instructions, examples, and tips.
      `;

      // Попробуем сначала Docker URL, затем localhost
      let response: any;

      try {
        // Пробуем подключиться через Docker
        response = await axios.post('http://ai-api:5000/generate', {
          prompt,
        }, { timeout: 3000 }); // Таймаут 3 секунды
      } catch (dockerError) {
        // Если не удалось, пробуем localhost
        this.logger.log('Не удалось подключиться к AI-сервису через Docker, пробуем localhost...');
        try {
          response = await axios.post('http://localhost:5000/generate', {
            prompt,
          });
        } catch (localhostError) {
          // Если и это не удалось, выбрасываем ошибку
          this.logger.error('Не удалось подключиться к AI-сервису ни через Docker, ни через localhost');
          throw new Error('Не удалось подключиться к AI-сервису');
        }
      }

      if (!response.data.response) {
        throw new Error('Ответ Python API пустой.');
      }

      const guideData: GuideData =
        typeof response.data.response === 'string'
          ? JSON.parse(response.data.response)
          : response.data.response;

      if (!guideData || !Array.isArray(guideData.chapters)) {
        throw new Error('Неверный формат ответа API. Ожидался список глав.');
      }

      const chaptersData = guideData.chapters.map((chapter: Chapter, index: number) => ({
        chapterTitle: chapter.chapterTitle || `Chapter ${index + 1}`,
        contents: [
          {
            type: 'paragraph',
            value: chapter.content,
          },
        ],
      }));

      return {
        title: guideData.title,
        description: guideData.description,
        prev_img: 'https://placehold.co/300x300?text=Guide+Preview',
        chapters: chaptersData,
      };
    } catch (error: any) {
      this.logger.error(
        'Ошибка при генерации гайда через Python API:',
        error.message,
      );
      throw new Error('Не удалось сгенерировать гайд.');
    }
  }
}
