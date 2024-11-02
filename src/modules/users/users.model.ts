// users/users.model.ts
import { ApiProperty } from "@nestjs/swagger";
import { Column, Model, DataType, Table, BelongsToMany } from "sequelize-typescript";
import { Role } from "src/modules/roles/roles.model";
import { UserRoles } from "src/modules/roles/user-roles.model";

interface UserCreationAttrs {
  email: string;
  password: string;
  name?: string; 
  country?: string; 
  city?: string;
  phone?: string;
  language?: string; 
  photo?: string;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {

  @ApiProperty({ example: '1', description: 'Unique id' })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: 'Example123@gmail.com', description: 'Email' })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  email: string;

  @ApiProperty({ example: 'Example123qwe', description: 'User password' })
  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Name of the user' })
  @Column({ type: DataType.STRING, allowNull: true }) 
  name: string;

  @ApiProperty({ example: 'false', description: 'Banned status' })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  banned: boolean;

  @ApiProperty({ example: 'Pushed Secret to GitHub', description: 'Ban reason' })
  @Column({ type: DataType.STRING, defaultValue: null })
  banReason: string;

  @ApiProperty({ example: 'USA', description: 'Country of the user' })
  @Column({ type: DataType.STRING, allowNull: true })
  country: string;

  @ApiProperty({ example: 'New York', description: 'City of the user' })
  @Column({ type: DataType.STRING, allowNull: true })
  city: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number of the user' })
  @Column({ type: DataType.STRING, allowNull: true })
  phone: string;

  @ApiProperty({ example: 'English', description: 'Preferred language of the user' })
  @Column({ type: DataType.STRING, allowNull: true })
  language: string;

  @ApiProperty({ example: '/uploads/photo.jpg', description: 'Path to the user photo' })
  @Column({ type: DataType.STRING, allowNull: true })
  photo: string;

  @BelongsToMany(() => Role, () => UserRoles)
  roles: Role[];
}
