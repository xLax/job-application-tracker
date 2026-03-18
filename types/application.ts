// Shared application form / API types

export interface ApplicationFormData {
  company: string;
  position: string;
  location: string;
  stage: string;
  interviewType: string;
  dateApplied: string;
  employmentType: string;
  workMode: string;
  notes: string;
}

export interface Application {
  _id: string;
  userId: string;
  company: string;
  position: string;
  location: string;
  stage: string;
  interviewType?: string;
  dateApplied: string;
  employmentType: string;
  workMode: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
