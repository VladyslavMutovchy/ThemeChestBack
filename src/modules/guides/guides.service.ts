import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Guide } from '../creator/creator.model';
import { convertFileToBase64 } from '../../utils/fileUtils';
import { Model } from 'mongoose';
import { InjectModel as InjectMongoModel } from '@nestjs/mongoose';
import { KeyWords } from '../creator/schemas/keywords.schema';
import { Op } from 'sequelize';
import { KEYWORDS } from '../creator/constants/keywords';

@Injectable()
export class GuidesService {
  constructor(
    @InjectModel(Guide) private readonly guideModel: typeof Guide,
    @InjectMongoModel('KeyWords') private readonly keyWordsModel: Model<KeyWords>,
  ) {}

  async getGuidesPaginated(
    page: number,
    pageSize: number,
    keywords: string[] = [],
    searchQuery: string = '',
  ): Promise<{ data: Guide[]; total: number }> {
    const offset = (page - 1) * pageSize;

    let guideIds: number[] = [];

    if (keywords.length > 0) {
      const keywordIds = keywords.map(keyword => {
        return parseInt(Object.keys(KEYWORDS).find(key => KEYWORDS[key] === keyword) || '0', 10);
      });

      const keywordGuides = await this.keyWordsModel.find({
        themes: { $in: keywordIds },
      });

      guideIds = keywordGuides.map(keywordGuide => keywordGuide.guide_id);
    }

    const whereCondition: any = {};

    if (guideIds.length > 0) {
      whereCondition.id = { [Op.in]: guideIds };
    }

    if (searchQuery) {
      whereCondition.title = { [Op.like]: `%${searchQuery}%` };
    }

    const { rows, count } = await this.guideModel.findAndCountAll({
      where: whereCondition,
      limit: pageSize,
      offset,
    });

    rows.forEach((guide) => {
      if (guide.prev_img) {
        const imagePath = path.join(
          __dirname,
          '..',
          '..',
          '..',
          'uploads',
          'preview',
          String(guide.id),
          path.basename(guide.prev_img),
        );

        const base64Data = convertFileToBase64(imagePath);
        if (base64Data) {
          guide.prev_img = `data:${base64Data.mimeType};base64,${base64Data.base64}`;
        }
      }
    });

    return { data: rows, total: count };
  }
}
