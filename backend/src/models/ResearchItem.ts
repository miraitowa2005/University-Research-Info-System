import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface ResearchItemAttributes {
  id: number;
  user_id: number;
  subtype_id: number;
  title: string;
  content_json?: JSON;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  submit_time?: Date;
  approve_time?: Date;
  audit_remarks?: string;
  file_url?: string;
  created_at: Date;
  updated_at: Date;
}

export class ResearchItem extends Model<ResearchItemAttributes> implements ResearchItemAttributes {
  public id!: number;
  public user_id!: number;
  public subtype_id!: number;
  public title!: string;
  public content_json?: JSON;
  public status!: 'draft' | 'pending' | 'approved' | 'rejected';
  public submit_time?: Date;
  public approve_time?: Date;
  public audit_remarks?: string;
  public file_url?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

ResearchItem.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    subtype_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content_json: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'draft',
    },
    submit_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approve_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    audit_remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    file_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'research_items',
    timestamps: false,
  }
);