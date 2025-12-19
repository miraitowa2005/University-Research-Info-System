import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface RoleAttributes {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_system: boolean;
}

export class Role extends Model<RoleAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public description?: string;
  public is_system!: boolean;
}

Role.init(
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
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_system: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'roles',
    timestamps: false,
  }
);