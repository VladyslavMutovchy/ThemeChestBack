import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminListService } from './admin-list.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin-list')
export class AdminListController {
  constructor(private readonly adminListService: AdminListService) {}

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async fetchUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') searchQuery?: string,
  ) {
    return this.adminListService.getPaginatedUsers(page, limit, searchQuery);
  }
}
