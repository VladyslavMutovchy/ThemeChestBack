import { Controller, Get, Query } from '@nestjs/common';
import { GuidesService } from './guides.service';
import { Guide } from '../creator/creator.model';

@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get('/fetchGuidesPaginated')
  async fetchGuidesPaginated(
    @Query('page') page: number = 1,
    @Query('keywords') keywords: string = '',
    @Query('search') search: string = ''
  ): Promise<{ data: Guide[]; total: number }> {
    const pageSize = 6;

    const keywordArray = keywords ? keywords.split(',') : [];

    return this.guidesService.getGuidesPaginated(page, pageSize, keywordArray, search);
  }
}
