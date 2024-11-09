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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatorService } from './creator.service';
import { Guide } from './creator.model';
import { CreateGuideDto } from './dto/creator.dto';
import { AddKeyWordsDto } from './dto/add-keywords.dto';
import { KeyWords } from './schemas/keywords.schema';

@Controller('creator')
export class CreatorController {
  private readonly logger = new Logger(CreatorController.name);

  constructor(private readonly creatorService: CreatorService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/createGuide')
  async createGuide(@Body() createGuideDto: CreateGuideDto, @Request() req): Promise<Guide> {
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
  async updateGuideThemes(@Body() addKeyWordsDto: AddKeyWordsDto): Promise<void> {
    await this.creatorService.updateGuideThemes(addKeyWordsDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/getGuideThemes/:guide_id')
  async getGuideThemes(@Param('guide_id') guideId: string): Promise<KeyWords> {
    return this.creatorService.getGuideThemes(guideId);
  }
  

 }
