import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id: number;
  username: string;
  password_hash: string;
  real_name: string;
  dept_id?: number;
  title_id?: number;
  email?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password_hash!: string;
  public real_name!: string;
  public dept_id?: number;
  public title_id?: number;
  public email?: string;
  public phone?: string;
  public avatar_url?: string;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Hooks
  beforeCreate: any;
  beforeUpdate: any;

  // Methods
  async comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password_hash);
  }
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    real_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    dept_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    title_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
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
    tableName: 'users',
    timestamps: false,
    hooks: {
      beforeCreate: async (user: User) => {
        // Password hashing is now handled in the controller
      },
      beforeUpdate: async (user: User) => {
        // Password hashing is now handled in the controller
      },
    },
  }
);