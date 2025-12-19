import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface ReviewTemplateAttributes {
  id: number;
  admin_id: number;
  title: string;
  content: string;
  is_shared: boolean;
  created_at: Date;
}

export class ReviewTemplate extends Model<ReviewTemplateAttributes> implements ReviewTemplateAttributes {
  public id!: number;
  public admin_id!: number;
  public title!: string;
  public content!: string;
  public is_shared!: boolean;
  public created_at!: Date;
}

ReviewTemplate.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    admin_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_shared: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'review_templates',
    timestamps: false,
  }
);

export default ReviewTemplate;
