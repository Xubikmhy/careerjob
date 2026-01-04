export type CandidateStatus = 'ACTIVE' | 'PLACED' | 'ARCHIVED';
export type PaymentStatus = 'PENDING' | 'OVERDUE' | 'PAID';
export type VacancyStatus = 'OPEN' | 'FILLED';

export interface AppSettings {
  agencyName: string;
  logoUrl: string;
  commissionPercent: number;
  address: string;
  contact: string;
}

// CV Studio Types
export type EducationLevel = 'Masters' | 'Bachelors' | 'Plus2' | 'SEE' | 'Other';

export interface EducationEntry {
  id: string;
  level: EducationLevel;
  degree: string;
  board: string;
  year: string;
  marks: string;
  isEquivalent: boolean;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string;
}

export interface CVData {
  email?: string;
  linkedin?: string;
  github?: string;
  summaryType: 'Fresher' | 'Experienced';
  summary: string;
  educations: EducationEntry[];
  experiences: ExperienceEntry[];
  skills: string;
  languages?: string;
  certifications?: string;
  projects?: string;
  awards?: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  mobile: string;
  address: string;
  skills: string;
  experience: string;
  education: string;
  isRegFeePaid: boolean;
  status: CandidateStatus;
  createdAt: string;
  isAiEnhanced?: boolean;
  cvData?: CVData;
}

export interface Vacancy {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  address: string;
  role: string;
  count: number;
  timing: string;
  requiredSkills: string;
  salary: string;
  remarks: string;
  status: VacancyStatus;
  createdAt: string;
}

export interface Placement {
  id: string;
  candidateId: string;
  companyName: string;
  jobRole: string;
  salary: number;
  joiningDate: string;
  commissionAmount: number;
  commissionDueDate: string;
  paymentStatus: PaymentStatus;
}

// Extended form state
export interface CVFormState extends CVData {
  fullName: string;
  mobile: string;
  address: string;
}
