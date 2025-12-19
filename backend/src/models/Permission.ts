import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface PermissionAttributes {
  id: number;
  code: string;
  name: string;
  module: string;
}

export class Permission extends Model<PermissionAttributes> implements PermissionAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
  public module!: string;
}

Permission.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'permissions',
    timestamps: false,
  }
);