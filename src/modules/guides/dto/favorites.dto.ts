// favorite.dto.ts
import { IsNotEmpty, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteGuidesDto {
  @ApiProperty({ example: 1, description: 'ID пользователя' })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsNumber({}, { message: 'User ID must be a number' })
  user_id: number;

  @ApiProperty({
    example: '[1, 9, 23]',
    description: 'Array of guide IDs',
  })
  @IsArray({ message: 'Favorite guides must be an array' })
  @IsNumber({}, { each: true, message: 'Each guide ID must be a number' })
  favorite_guides: number[];
}
