import { IsString, IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';

export class UserDto {
  @IsString()
  @IsOptional()
  email?: string;

  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  city?: string;
}
