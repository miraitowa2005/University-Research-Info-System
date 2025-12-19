import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface TitleAttributes {
  id: number;
  name: string;
  level: number;
}

export class Title extends Model<TitleAttributes> implements TitleAttributes {
  public id!: number;
  public name!: string;
  public level!: number;
}

Title.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'mdm_titles',
    timestamps: false,
  }
);