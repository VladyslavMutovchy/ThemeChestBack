//creator.controller.ts
import {
  Controller,
  UseGuards,
  Post,
  Body,
  Request,
  Logger,
  Get,
  Param,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatorService } from './creator.service';
import { Guide } from './creator.model';
import { CreateGuideDto } from './dto/creator.dto';
import { AddKeyWordsDto } from './dto/add-keywords.dto';
import { KeyWords } from './schemas/keywords.schema';
import { Chapters } from './schemas/chapters.schema';
import { ChaptersDto } from './dto/chapters.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('creator')
export class CreatorController {
  private readonly logger = new Logger(CreatorController.name);

  constructor(private readonly creatorService: CreatorService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/createGuide')
  async createGuide(
    @Body() createGuideDto: CreateGuideDto,
    @Request() req,
  ): Promise<Guide> {
    const user = req.user;
    createGuideDto.user_id = user.id;
    return this.creatorService.createGuide(createGuideDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/getGuidesData/:userId')
  async getGuidesData(@Param('userId') userId: string): Promise<Guide[]> {
    return this.creatorService.getGuidesData(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/updateGuideThemes')
  async updateGuideThemes(
    @Body() addKeyWordsDto: AddKeyWordsDto,
  ): Promise<void> {
    await this.creatorService.updateGuideThemes(addKeyWordsDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/getGuideThemes/:guide_id')
  async getGuideThemes(@Param('guide_id') guide_id: string): Promise<KeyWords> {
    return this.creatorService.getGuideThemes(guide_id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/updateGuideChapters')
  @UseInterceptors(AnyFilesInterceptor())
  async updateGuideChapters(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any,
  ): Promise<void> {
    const chaptersData =
      typeof body.chapters === 'string'
        ? JSON.parse(body.chapters)
        : body.chapters;

    const chaptersDto = {
      guide_id: parseInt(body.guide_id, 10),
      chapters: chaptersData,
    };

    if (!chaptersDto.chapters || !Array.isArray(chaptersDto.chapters)) {
      chaptersDto.chapters = [];
    }
    // Очищаем папку с файлами
    const uploadDir = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'guides',
      String(chaptersDto.guide_id),
    );

    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }

    fs.mkdirSync(uploadDir, { recursive: true });
    if (files.length > 0) {
      let fileIndex = 0;

      chaptersDto.chapters.forEach((chapter, chapterIndex) => {
        chapter.contents.forEach((content, contentIndex) => {
          if (content.type === 'img') {
            if (files[fileIndex]) {
              const file = files[fileIndex];
              const { originalname, buffer } = file;
              const filePath = path.join(uploadDir, originalname);

              fs.writeFileSync(filePath, buffer);

              content.value = `/uploads/guides/${chaptersDto.guide_id}/${originalname}`;

              fileIndex++;
            } else {
              this.logger.warn(
                `Not enough uploaded files to match img contents.`,
              );
            }
          }
        });
      });
    } else {
      this.logger.warn('No files were uploaded');
    }

    // Обновляем главы в базе данных
    await this.creatorService.updateGuideChapters(chaptersDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getGuideChapters/:guide_id')
  async getGuideChapters(@Param('guide_id') guide_id: string): Promise<any> {
    try {
      const chaptersData: Chapters =
        await this.creatorService.getGuideChapters(guide_id);

      if (!chaptersData) {
        return {
          guide_id,
          chapters: [],
        };
      }

      const enrichedChapters = chaptersData.chapters.map((chapter) => {
        const updatedContents = Array.isArray(chapter.contents)
          ? chapter.contents.map((content) => {
              if (content.type === 'img' && content.value) {
                const imagePath = path.join(
                  __dirname,
                  '..',
                  '..',
                  'uploads',
                  'guides',
                  guide_id,
                  path.basename(content.value),
                );

                if (fs.existsSync(imagePath)) {
                  const fileBuffer = fs.readFileSync(imagePath);
                  const base64Image = fileBuffer.toString('base64');
                  const mimeType = this.getMimeTypeFromExtension(
                    path.extname(imagePath),
                  );

                  return {
                    ...content,
                    value: {
                      url: content.value,
                      base64: base64Image,
                      mimeType,
                    },
                  };
                }
              }

              return content;
            })
          : [];
        return {
          ...chapter,
          contents: updatedContents,
        };
      });

      return {
        guide_id: chaptersData.guide_id,
        chapters: enrichedChapters,
      };
    } catch (error) {
      console.error('Ошибка при получении глав:', error);
    
      return {
        guide_id,
        chapters: [],
      };
    }
  }

  private getMimeTypeFromExtension(extension: string): string {
    switch (extension.toLowerCase()) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }
}
