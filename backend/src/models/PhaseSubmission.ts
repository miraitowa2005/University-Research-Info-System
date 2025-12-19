import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface PhaseSubmissionAttributes {
  id: number;
  phase_id: number;
  applicant_id: number;
  status: 'not_started' | 'submitted' | 'returned';
  submitted_at?: Date;
  file_url?: string;
  remarks?: string;
}

export class PhaseSubmission extends Model<PhaseSubmissionAttributes> implements PhaseSubmissionAttributes {
  public id!: number;
  public phase_id!: number;
  public applicant_id!: number;
  public status!: 'not_started' | 'submitted' | 'returned';
  public submitted_at?: Date;
  public file_url?: string;
  public remarks?: string;
}

PhaseSubmission.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    phase_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    applicant_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('not_started', 'submitted', 'returned'),
      allowNull: false,
      defaultValue: 'not_started',
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    file_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'phase_submissions',
    timestamps: false,
  }
);