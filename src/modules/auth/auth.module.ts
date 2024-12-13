import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
// import { IsEmailUnique } from './auth.validator';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService
  ],
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: process.env.PRIVATE_KEY || 'SECRET',
      signOptions: {
        expiresIn: '77d',
      },
    }),
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
