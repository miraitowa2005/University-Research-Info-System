import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface ProjectNoticeAttributes {
  id: number;
  title: string;
  content: string;
  publish_by: number;
  created_at: Date;
}

export class ProjectNotice extends Model<ProjectNoticeAttributes> implements ProjectNoticeAttributes {
  public id!: number;
  public title!: string;
  public content!: string;
  public publish_by!: number;
  public created_at!: Date;
}

ProjectNotice.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    publish_by: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'project_notices',
    timestamps: false,
  }
);