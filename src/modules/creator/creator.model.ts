//creator.model.ts
import { ApiProperty } from '@nestjs/swagger';
import { Column, Model, DataType, Table } from 'sequelize-typescript';

@Table({ tableName: 'guides' })
export class Guide extends Model<Guide> {
  @ApiProperty({ example: '1', description: 'Уникальный id' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Guide to Baking', description: 'Название гайда' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @ApiProperty({ example: '1', description: 'ID пользователя' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @ApiProperty({ example: 'How to boil water', description: 'Description for miniature' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  description: string;

  @ApiProperty({ example: '', description: 'Description for miniature' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  prev_img: string;
}