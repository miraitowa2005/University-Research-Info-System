import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface ResearchTagAttributes {
  id: number;
  name: string;
  category?: string;
}

export class ResearchTag extends Model<ResearchTagAttributes> implements ResearchTagAttributes {
  public id!: number;
  public name!: string;
  public category?: string;
}

ResearchTag.init(
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
    category: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'research_tags',
    timestamps: false,
  }
);