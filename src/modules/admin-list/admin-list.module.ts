import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminListService } from './admin-list.service';
import { AdminListController } from './admin-list.controller';
import { User } from '../users/users.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [AdminListController],
  providers: [AdminListService],
  imports: [SequelizeModule.forFeature([User]), AuthModule],
})
export class AdminListModule {}
