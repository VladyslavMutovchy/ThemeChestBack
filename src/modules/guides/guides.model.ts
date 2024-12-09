import { ApiProperty } from '@nestjs/swagger';
import { Column, Model, DataType, Table } from 'sequelize-typescript';

@Table({ tableName: 'favorite_guides' })
export class FavoriteGuides extends Model<FavoriteGuides> {
  @ApiProperty({ example: 1, description: 'ID пользователя' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
  })
  user_id: number;

  @ApiProperty({ example: '[1, 9, 23]', description: 'Array of guide IDs' })
  @Column({
    type: DataType.JSON, 
    allowNull: true,
  })
  favorite_guides: number[];
}

