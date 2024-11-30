import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
    userDto: Partial<UserDto>,
    file?: Express.Multer.File,
  ) {
    const user = await this.userModel.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    if (userDto.name !== undefined) user.name = userDto.name;
    if (userDto.phone !== undefined) user.phone = userDto.phone;
    if (userDto.language !== undefined) user.language = userDto.language;
    if (userDto.country !== undefined) user.country = userDto.country;
    if (userDto.city !== undefined) user.city = userDto.city;

    if (file) {
      if (user.photo) {
        const oldPhotoPath = path.join(__dirname, '..', '..', '..', user.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      const userDir = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
        'profiles',
        String(id),
      );
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      const filePath = path.join(userDir, file.originalname);

      await fs.promises.writeFile(filePath, file.buffer);

      user.photo = `/uploads/profiles/${id}/${file.originalname}`;
    }

    await user.save();
    return user;
  }

  async getUserProfile(id: number) {
    const user = await this.userModel.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const photoPath = user.photo
      ? path.join(__dirname, '..', '..', '..', user.photo)
      : null;
    let photoData = null;
    let mimeType = null;

    if (photoPath && fs.existsSync(photoPath)) {
      const fileExtension = path.extname(photoPath).toLowerCase();
      if (fileExtension === '.png') {
        mimeType = 'image/png';
      } else if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
        mimeType = 'image/jpeg';
      }

      photoData = fs.readFileSync(photoPath);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      language: user.language,
      country: user.country,
      city: user.city,
      photo: photoData ? photoData.toString('base64') : null,
      mimeType,
    };
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

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Incorrect current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return { message: 'Password updated successfully' };
  }
}
