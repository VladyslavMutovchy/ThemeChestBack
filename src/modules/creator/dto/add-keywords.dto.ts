
import { IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddKeyWordsDto {
  @ApiProperty({ example: '1', description: 'ID гайда' })
  @IsNotEmpty({ message: 'Guide ID is required' })
  guide_id: number;

  @ApiProperty({ example: ['cooking', 'baking'], description: 'Ключевые слова' })
  @IsArray({ message: 'Key words must be an array' })
  themes: string[];
}
