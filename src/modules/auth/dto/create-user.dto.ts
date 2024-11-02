import { IsEmail, IsString, IsNotEmpty,  MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {

    @ApiProperty({ example: 'user@gmail.com', description: 'User email address' })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    readonly email: string;

    @ApiProperty({ example: 'strongpassword123', description: 'User password' })
    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be a string' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(20, { message: 'Password can be a maximum of 20 characters' })
    readonly password: string;
}
