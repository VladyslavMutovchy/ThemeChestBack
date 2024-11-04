import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  NotFoundException,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/postUserProfile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const id = parseInt(body.id, 10);
    const user = await this.profileService.updateUserProfile(id, body, file);
    return user;
  }
  @UseGuards(JwtAuthGuard)
  @Get('/getUserData/:id')
  async getUserData(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.profileService.getUserProfile(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      photo: user.photo ? user.photo : null, 
      mimeType: user.mimeType,
    };
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('/changePassword/:id')
  async changePassword(
    @Param('id') id: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    const userId = parseInt(id, 10);
    try {
      const response = await this.profileService.updateUserPassword(userId, currentPassword, newPassword);
      return response;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Incorrect current password');
      }
      throw error;
    }
  }
}
