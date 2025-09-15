// Central export for all types
export * from './user';
export * from './opportunities';

// Additional type definitions that were missing

export interface CareerProfile {
  current_role: string;
  career_level: string;
  industry: string;
  skills: string[];
  preferred_roles: string[];
  jobTitle?: string; // Legacy support
  profileSummary?: string; // For profile summary
}

export interface AIPreferences {
  ai_assistance_enabled: boolean;
  preferred_communication_style: string;
  job_alert_frequency: string;
  opportunities?: string[];
  prioritizeBy?: string;
  salaryExpectation?: number;
}

export interface CompletionStatus {
  overall: number;
  personal: number;
  career: number;
  education: number;
  experience: number;
}

// Document interface
export interface CVFile {
  filename?: string;
  uploadedAt?: string;
  hasCvInGcs?: boolean;
  downloadUrl?: string;
}
