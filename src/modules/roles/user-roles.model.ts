//roles/user-roles.model.ts
import { Column, Model, DataType,Table, ForeignKey } from "sequelize-typescript";
import { User } from "src/modules/users/users.model";
import { Role } from "./roles.model";

// связывание 2х таблиц,  users.model.ts --- roles.model.ts + подключить в модУлях, модЕлях,в апе 

@Table({tableName:'user_roles', createdAt: false, updatedAt: false})
export class UserRoles extends Model<UserRoles> {

  @Column({type:DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;
  
  @ForeignKey(() => Role)
  @Column({type:DataType.INTEGER})
  roleId: number;
  
  @ForeignKey(() => User)
  @Column({type:DataType.INTEGER})
  userId: number;
  


}