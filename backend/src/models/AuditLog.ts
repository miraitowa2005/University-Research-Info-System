import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface AuditLogAttributes {
  id: number;
  user_id: number;
  action: string;
  target_type?: string;
  target_id?: number;
  old_value?: JSON;
  new_value?: JSON;
  ip?: string;
  created_at: Date;
}

export class AuditLog extends Model<AuditLogAttributes> implements AuditLogAttributes {
  public id!: number;
  public user_id!: number;
  public action!: string;
  public target_type?: string;
  public target_id?: number;
  public old_value?: JSON;
  public new_value?: JSON;
  public ip?: string;
  public created_at!: Date;
}

AuditLog.init(
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
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    target_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    target_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    old_value: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    new_value: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: false,
  }
);