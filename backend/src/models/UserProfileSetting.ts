import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserProfileSettingAttributes {
  user_id: number;
  is_public_profile: boolean;
  show_funding: boolean;
}

export class UserProfileSetting extends Model<UserProfileSettingAttributes> implements UserProfileSettingAttributes {
  public user_id!: number;
  public is_public_profile!: boolean;
  public show_funding!: boolean;
}

UserProfileSetting.init(
  {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    is_public_profile: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
    },
    show_funding: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'user_profile_settings',
    timestamps: false,
  }
);