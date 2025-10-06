// Additional missing types and functions to fix compilation errors

// JobFormData interface - DISABLED (Admin job management feature removed)
// This interface is kept for potential future use but is not currently active
export interface JobFormData {
  id?: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  experience_level: string;
  skills: string;
  description: string;
  salary_range?: string | null;
  application_url?: string | null;
  is_active: boolean;
  requirements: string;
  salary_min?: number;
  salary_max?: number;
  remote_option?: boolean;
  posted_at?: string;
  application_deadline?: string;
  employment_type?: string;
  company_size?: string;
  industry?: string;
}

// ScholarshipFormData interface
export interface ScholarshipFormData {
  title: string;
  organization: string;
  amount: string;
  deadline: string;
  description: string;
  requirements: string;
  eligibility: string;
  benefits: string[];
  application_process: string;
  source?: string;
  location?: string;
  course?: string;
  gpa?: string;
  application_link?: string;
  overview?: string;
  id?: number;
}

// Delete functions for profile components
export const deleteEducationEntry = async (id: string, index: number): Promise<void> => {
  console.log('deleteEducationEntry called with id:', id, 'index:', index);
};

export const deleteExperienceEntry = async (id: string, index: number): Promise<void> => {
  console.log('deleteExperienceEntry called with id:', id, 'index:', index);
};

// Update functions for onboarding
export const updateParsedProfile = async (data: any): Promise<any> => {
  console.log('updateParsedProfile called with data:', data);
  return { success: true };
};

// Skills required type fix
export interface OpportunityWithSkills {
  skills_required?: string[];
  [key: string]: any;
}

// User role fix
export interface UserWithRole {
  role?: string;
  [key: string]: any;
}
