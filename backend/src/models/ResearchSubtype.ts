import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface ResearchSubtypeAttributes {
  id: number;
  category_id: number;
  name: string;
  required_fields_json?: JSON;
  template_url?: string;
  is_active: boolean;
}

export class ResearchSubtype extends Model<ResearchSubtypeAttributes> implements ResearchSubtypeAttributes {
  public id!: number;
  public category_id!: number;
  public name!: string;
  public required_fields_json?: JSON;
  public template_url?: string;
  public is_active!: boolean;
}

ResearchSubtype.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    required_fields_json: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    template_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'research_subtypes',
    timestamps: false,
  }
);