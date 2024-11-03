//users/users.controller.ts
import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './users.model';



@ApiTags('пользователя')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({summary: 'Создание пользователя'})
  @ApiResponse({status: 200, type: User})
  @Post()
  create(@Body() userDto: CreateUserDto) {
    return this.usersService.createUser(userDto);
  }


  
  // @ApiOperation({summary: 'GetAll пользователей'})
  // @ApiResponse({status: 200, type: [User]})
  // @UseGuards(JwtAuthGuard)                  //
  // @Get()
  // getAll() {
  //   return this.usersService.getAllUsers();
  // }
}
