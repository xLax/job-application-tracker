import mongoose, { Schema, Document, Types } from 'mongoose';
import { STAGES, INTERVIEW_TYPES, EMPLOYMENT_TYPES, WORK_MODES } from '@/lib/constants';

export interface IApplication extends Document {
  userId: Types.ObjectId;
  company: string;
  position: string;
  location: string;
  stage: string;
  interviewType?: string;
  dateApplied: Date;
  employmentType: string;
  workMode: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VALID_STAGES = STAGES;
const VALID_INTERVIEW_TYPES = INTERVIEW_TYPES;
const VALID_EMPLOYMENT_TYPES = EMPLOYMENT_TYPES;
const VALID_WORK_MODES = WORK_MODES;

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
      minlength: [2, 'Company must be at least 2 characters'],
      maxlength: [100, 'Company must be at most 100 characters'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
      minlength: [2, 'Position must be at least 2 characters'],
      maxlength: [100, 'Position must be at most 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [100, 'Location must be at most 100 characters'],
    },
    stage: {
      type: String,
      required: [true, 'Stage is required'],
      enum: { values: VALID_STAGES, message: 'Invalid stage value' },
      default: 'Applied',
    },
    interviewType: {
      type: String,
      trim: true,
      default: '',
    },
    dateApplied: {
      type: Date,
      required: [true, 'Date applied is required'],
    },
    employmentType: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: { values: VALID_EMPLOYMENT_TYPES, message: 'Invalid employment type' },
      default: 'Full Time',
    },
    workMode: {
      type: String,
      required: [true, 'Work mode is required'],
      enum: { values: VALID_WORK_MODES, message: 'Invalid work mode' },
      default: 'Not Specified',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must be at most 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Application =
  mongoose.models.Application ||
  mongoose.model<IApplication>('Application', ApplicationSchema);
