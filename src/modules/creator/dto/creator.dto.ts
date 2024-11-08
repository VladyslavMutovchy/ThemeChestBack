//creator.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGuideDto {
  @ApiProperty({ example: 'Guide to Baking', description: 'Название гайда' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiProperty({ example: '1', description: 'ID пользователя' })
  @IsNotEmpty({ message: 'User ID is required' })
  user_id: number;
}
