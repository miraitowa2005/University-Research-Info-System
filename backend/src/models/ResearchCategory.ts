import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface ResearchCategoryAttributes {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export class ResearchCategory extends Model<ResearchCategoryAttributes> implements ResearchCategoryAttributes {
  public id!: number;
  public name!: string;
  public sort_order!: number;
  public is_active!: boolean;
}

ResearchCategory.init(
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
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'research_categories',
    timestamps: false,
  }
);