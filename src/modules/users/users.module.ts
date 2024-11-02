//users/users.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users.model';
import { Role } from 'src/modules/roles/roles.model';
import { UserRoles } from 'src/modules/roles/user-roles.model';
import { RolesModule } from 'src/modules/roles/roles.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    forwardRef(()=> AuthModule),
    SequelizeModule.forFeature([User, Role, UserRoles]),
    RolesModule
  ], 
  exports: [ 
    UsersService
  ]
})
export class UsersModule {}
