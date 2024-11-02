//roles/roles.model.ts
import { ApiProperty } from "@nestjs/swagger";
import { Column, Model, DataType,Table, BelongsToMany } from "sequelize-typescript";
import { User } from "src/modules/users/users.model";
import { UserRoles } from "./user-roles.model";

interface RoleCreationAttrs {
  value: string;
  description: string;
}


@Table({tableName:'roles'})
export class Role extends Model<Role,  RoleCreationAttrs> {

  @ApiProperty({example: '1', description: 'Уникальный id'})
  @Column({type:DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;
  
  
  @ApiProperty({example: 'Admin', description: 'Роль пользователя'})
  @Column({type:DataType.STRING, unique: true, allowNull: false})
  value: string;
  

  
  @ApiProperty({example: 'Администратор', description: 'описание роли'})
  @Column({type:DataType.STRING,  allowNull: false})
  description: string;
  
  

@BelongsToMany(() => User, () => UserRoles) // связывание 2х таблиц,  users.model.ts --- roles.model.ts + подключить в модулях
users:User[];

static async createDefaultRoles() {
  const roles = [
    { value: 'admin', description: 'Admin' },
    { value: 'moderator', description: 'Moderator' },
    { value: 'user', description: 'User' },
    { value: 'creator', description: 'Content Creator' },
  ];

  for (const role of roles) {
    await Role.findOrCreate({
      where: { value: role.value }, // проверяем по полю value
      defaults: role,
    });
  }
}
}
