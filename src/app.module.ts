//app.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './modules/users/users.model';
import { RolesModule } from './modules/roles/roles.module';
import { Role } from './modules/roles/roles.model';
import { UserRoles } from './modules/roles/user-roles.model';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CreatorModule } from './modules/creator/creator.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      models: [User, Role, UserRoles],
      autoLoadModels: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_DB_URI),
    UsersModule,
    RolesModule,
    AuthModule,
    ProfileModule,
    CreatorModule,
  ],
  providers: [],
})
export class AppModule {}
