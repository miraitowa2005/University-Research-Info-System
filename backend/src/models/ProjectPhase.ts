import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface ProjectPhaseAttributes {
  id: number;
  notice_id: number;
  name: string;
  deadline: Date;
  description?: string;
}

export class ProjectPhase extends Model<ProjectPhaseAttributes> implements ProjectPhaseAttributes {
  public id!: number;
  public notice_id!: number;
  public name!: string;
  public deadline!: Date;
  public description?: string;
}

ProjectPhase.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    notice_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'project_phases',
    timestamps: false,
  }
);