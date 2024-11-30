import {
  Controller,
  UseGuards,
  Post,
  Body,
  Request,
  Get,
  Param,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatorService } from './creator.service';
import { Guide } from './creator.model';
import { CreateGuideDto } from './dto/creator.dto';
import { AddKeyWordsDto } from './dto/add-keywords.dto';
import { KeyWords } from './schemas/keywords.schema';
import { Chapters } from './schemas/chapters.schema';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { convertFileToBase64 } from '../../utils/fileUtils';

@Controller('creator')
export class CreatorController {
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
  @Post('/updatePreviewGuide/:id')
  @UseInterceptors(AnyFilesInterceptor())
  async updatePreviewGuide(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Guide> {
    const { title, user_id, description } = body;

    const createGuideDto: {
      title: string;
      user_id: number;
      description?: string;
      prev_img?: string;
    } = {
      title: title,
      user_id: parseInt(user_id, 10),
      description: description,
    };

    const uploadDir = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'preview',
      String(id),
    );

    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }

    fs.mkdirSync(uploadDir, { recursive: true });

    if (files && files.length > 0) {
      const file = files[0];
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, file.buffer);

      createGuideDto.prev_img = `/uploads/preview/${id}/${filename}`;

      const base64Data = convertFileToBase64(filePath);
      if (base64Data) {
        console.log(
          `Base64 изображение: ${base64Data.base64.substring(0, 50)}...`,
        );
      }
    }

    return this.creatorService.updatePreviewGuide(id, createGuideDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/getPreviewGuide/:id')
  async getPreviewGuide(@Param('id', ParseIntPipe) id: number): Promise<any> {
    try {
      const guide = await this.creatorService.getGuideById(id);

      if (!guide) {
        return {
          message: `Guide с ID ${id} не найден.`,
        };
      }

      const result = {
        title: guide.title,
        user_id: guide.user_id,
        description: guide.description,
        prev_img: null,
      };

      if (guide.prev_img) {
        const imagePath = path.join(
          __dirname,
          '..',
          '..',
          '..',
          'uploads',
          'preview',
          String(id),
          path.basename(guide.prev_img),
        );

        const base64Data = convertFileToBase64(imagePath);
        if (base64Data) {
          result.prev_img = `data:${base64Data.mimeType};base64,${base64Data.base64}`;
        }
      }
      return result;
    } catch (error) {
      console.error('Ошибка при получении превью гайда:', error);
      throw error;
    }
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

    const uploadDir = path.join(
      __dirname,
      '..',
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
      chaptersDto.chapters.forEach((chapter) => {
        chapter.contents.forEach((content) => {
          if (content.type === 'img') {
            if (files[fileIndex]) {
              const file = files[fileIndex];
              const { originalname, buffer } = file;
              const filePath = path.join(uploadDir, originalname);
              fs.writeFileSync(filePath, buffer);
              content.value = `/uploads/guides/${chaptersDto.guide_id}/${originalname}`;
              fileIndex++;
            }
          }
        });
      });
    }

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
                  '..',
                  'uploads',
                  'guides',
                  guide_id,
                  path.basename(content.value),
                );

                const base64Data = convertFileToBase64(imagePath);

                if (base64Data) {
                  return {
                    ...content,
                    value: {
                      url: content.value,
                      base64: base64Data.base64,
                      mimeType: base64Data.mimeType,
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
    } catch {
      return {
        guide_id,
        chapters: [],
      };
    }
  }
}
