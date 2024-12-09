import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GuidesService } from './guides.service';
import { Guide } from '../creator/creator.model';

@Controller('guides/')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get('fetchGuidesPaginated')
  async fetchGuidesPaginated(
    @Query('page') page: number = 1,
    @Query('keywords') keywords: string = '',
    @Query('search') search: string = ''
  ): Promise<{ data: Guide[]; total: number }> {
    const pageSize = 6;

    const keywordArray = keywords ? keywords.split(',') : [];

    return this.guidesService.getGuidesPaginated(page, pageSize, keywordArray, search);
  }

  @Post('addToFavorites')
  async addToFavorites(
    @Body() body: { user_id: number; guide_id: number },
  ): Promise<{ message: string }> {

    const { user_id, guide_id } = body;
    if (!user_id || !guide_id) {
      throw new BadRequestException('User ID and Guide ID are required');
    }

    await this.guidesService.addToFavorites(user_id, guide_id);
    return { message: 'Guide added to favorites successfully' };
  }

  @Post('removeFromFavorites')
  async removeFromFavorites(
    @Body() body: { user_id: number; guide_id: number },
  ): Promise<{ message: string }> {

    const { user_id, guide_id } = body;
    if (!user_id || !guide_id) {
      throw new BadRequestException('User ID and Guide ID are required');
    }

    await this.guidesService.removeFromFavorites(user_id, guide_id);
    return { message: 'Guide removed from favorites successfully' };
  }

  @Post('getFavorites')
  async getFavorites(
    @Body() body: { user_id: number },
  ): Promise<{ favorites: number[] }> {

    const { user_id } = body;
    if (!user_id) {
      throw new BadRequestException('User ID is required');
    }

    const favorites = await this.guidesService.getFavorites(user_id);
    return { favorites };
  }
}
