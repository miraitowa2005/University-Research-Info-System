import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface SystemSettingAttributes {
  settings_key: string;
  settings_value?: string;
  description?: string;
  updated_at: Date;
}

export class SystemSetting extends Model<SystemSettingAttributes> implements SystemSettingAttributes {
  public settings_key!: string;
  public settings_value?: string;
  public description?: string;
  public updated_at!: Date;
}

SystemSetting.init(
  {
    settings_key: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
    },
    settings_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    tableName: 'system_settings',
    timestamps: false,
  }
);