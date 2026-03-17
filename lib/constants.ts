export const APPLICATION_STATUSES = [
  'Applied',
  'Phone Interview',
  'Interview',
  'Code Interview',
  'HR Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
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

export type ApplicationStatus = typeof APPLICATION_STATUSES[number];
export type EmploymentType = typeof EMPLOYMENT_TYPES[number];
export type WorkMode = typeof WORK_MODES[number];
