import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from '../users/users.model';

@Injectable()
export class AdminListService {
  constructor(@InjectModel(User) private readonly userRepository: typeof User) {}

  async getPaginatedUsers(page: number, limit: number, searchQuery?: string) {
    const offset = (page - 1) * limit;
    const whereClause = searchQuery
      ? {
          email: { [Op.iLike]: `%${searchQuery}%` }, 
        }
      : {};
  
    const users = await this.userRepository.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      attributes: { exclude: ['password'] }, 
      include: { all: true },
    });
  
    return {
      total: users.count,
      page,
      limit,
      data: users.rows,
    };
  }
  
}
