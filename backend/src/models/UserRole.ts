import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class UserRole extends Model {}

UserRole.init(
  {
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: 'user_roles',
    timestamps: false,
  }
);

export default UserRole;

