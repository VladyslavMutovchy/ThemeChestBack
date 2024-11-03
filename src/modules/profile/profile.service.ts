import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/users.model';
import { UserDto } from './dto/user.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async updateUserProfile(
    id: number,
    userDto: Partial<UserDto>, // Используем Partial<UserDto> для остальных полей
    file?: Express.Multer.File,
  ) {
    const user = await this.userModel.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    // Обновляем только те поля, которые действительно присутствуют в userDto
    if (userDto.name !== undefined) user.name = userDto.name;
    if (userDto.phone !== undefined) user.phone = userDto.phone;
    if (userDto.language !== undefined) user.language = userDto.language;
    if (userDto.country !== undefined) user.country = userDto.country;
    if (userDto.city !== undefined) user.city = userDto.city;

    // Обработка файла, если он передан
    if (file) {
      const userDir = path.join(__dirname, '..', '..', 'uploads', String(id));
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      const filePath = path.join(userDir, file.originalname);

      await fs.promises.writeFile(filePath, file.buffer);

      user.photo = `/uploads/${id}/${file.originalname}`;
    }

    await user.save();
    return user;
  }

  async getUserProfile(id: number) {
    const user = await this.userModel.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUserPassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userModel.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Incorrect current password');
    }

    // Хэшируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return { message: 'Password updated successfully' };
  }
}
