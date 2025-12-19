import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class RolePermission extends Model {}

RolePermission.init(
  {
    role_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    permission_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: 'role_permissions',
    timestamps: false,
  }
);

export default RolePermission;

