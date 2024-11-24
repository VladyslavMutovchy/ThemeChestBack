import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GuidesService } from './guides.service';
import { Guide } from '../creator/creator.model';

@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get('/fetchGuidesPaginated')
  async fetchGuidesPaginated(
    @Query('page') page: number = 1
  ): Promise<{ data: Guide[]; total: number }> {
    const pageSize = 6;
    if (page < 1) {
      throw new BadRequestException('Page must be a positive number.');
    }
    return this.guidesService.getGuidesPaginated(page, pageSize);
  }
}
