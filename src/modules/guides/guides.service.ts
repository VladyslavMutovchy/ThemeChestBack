import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Guide } from '../creator/creator.model';

@Injectable()
export class GuidesService {
  constructor(
    @InjectModel(Guide)
    private readonly guideModel: typeof Guide,
  ) {}

  async getGuidesPaginated(
    page: number,
    pageSize: number,
  ): Promise<{ data: Guide[]; total: number }> {
    const offset = (page - 1) * pageSize;

    const { rows, count } = await this.guideModel.findAndCountAll({
      limit: pageSize,
      offset: offset,
    });

    return { data: rows, total: count };
  }
}
