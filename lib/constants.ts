export const STAGES = [
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
] as const;

export const INTERVIEW_TYPES = [
  'Phone',
  'Code',
  'HR',
  'Other',
] as const;

export const EMPLOYMENT_TYPES = [
  'Full Time',
  'Part Time',
  'Contract',
] as const;

export const WORK_MODES = [
  'Not Specified',
  'On-Site',
  'Hybrid',
  'Remote',
] as const;

export type Stage = typeof STAGES[number];
export type InterviewType = typeof INTERVIEW_TYPES[number];
export type EmploymentType = typeof EMPLOYMENT_TYPES[number];
export type WorkMode = typeof WORK_MODES[number];
