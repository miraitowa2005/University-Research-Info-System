import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface ResearchCollaboratorAttributes {
  id: number;
  item_id: number;
  user_id: number;
  role?: string;
  is_confirmed: boolean;
}

export class ResearchCollaborator extends Model<ResearchCollaboratorAttributes> implements ResearchCollaboratorAttributes {
  public id!: number;
  public item_id!: number;
  public user_id!: number;
  public role?: string;
  public is_confirmed!: boolean;
}

ResearchCollaborator.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    item_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_confirmed: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'research_collaborators',
    timestamps: false,
  }
);