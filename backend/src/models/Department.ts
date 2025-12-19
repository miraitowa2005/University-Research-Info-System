import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface DepartmentAttributes {
  id: number;
  code: string;
  name: string;
  parent_id?: number;
  level: number;
  is_active: boolean;
  updated_at: Date;
}

export class Department extends Model<DepartmentAttributes> implements DepartmentAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
  public parent_id?: number;
  public level!: number;
  public is_active!: boolean;
  public updated_at!: Date;
}

Department.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    level: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    is_active: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
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
    tableName: 'mdm_departments',
    timestamps: false,
  }
);