import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { SequelizeModule } from '@nestjs/sequelize'; 
import { User } from '../users/users.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User]), 
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
