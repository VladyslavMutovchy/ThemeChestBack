import { IsNotEmpty, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChaptersDto {
  @ApiProperty({ example: 1, description: 'ID гайда' })
  @IsNotEmpty({ message: 'Guide ID is required' })
  @IsNumber()
  guide_id: number;

  @ApiProperty({ description: 'Главы, каждая может иметь произвольное содержимое' })
  @IsArray()
  chapters: any[]; 
}
