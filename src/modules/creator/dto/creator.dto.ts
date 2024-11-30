// creator.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGuideDto {
  @ApiProperty({ example: 'Guide to Baking', description: 'Название гайда' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiProperty({ example: '1', description: 'ID пользователя' })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsNumber({}, { message: 'User ID must be a number' })
  user_id: number;

  @ApiProperty({ example: 'How to boil water', description: 'Описание гайда для миниатюры' })
  @IsOptional() // Поле `description` не обязательно при создании
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({ example: 'uploads/image.jpg', description: 'Путь к изображению превью' })
  @IsOptional() // Поле `prev_img` не обязательно при создании
  @IsString({ message: 'Preview image path must be a string' })
  prev_img?: string;
}
