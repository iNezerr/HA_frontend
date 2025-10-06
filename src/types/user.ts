// User types and interfaces for the Hues Apply MVP

export type UserType = 'job' | 'scholarship' | 'grant';

export interface BaseUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string;
  user_type?: UserType;
  is_onboarding_complete?: boolean;
  google_data?: {
    picture: string;
    email: string;
  };
}

export interface PersonalInfo {
  first_name?: string; // Optional - collected during sign-up
  last_name?: string;  // Optional - collected during sign-up
  email?: string;      // Optional - collected during sign-up
  phone: string;       // Required - collected during onboarding
  address?: string;    // Optional - collected during onboarding if needed
  linkedin?: string;
  portfolio?: string;
  // Component compatibility fields
  name?: string;
  country?: string;
  goal?: string;
  location?: string;
  bio?: string;
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  gpa?: string;
  description?: string;
  // Component compatibility fields
  school?: string;
  startDate?: string;
  endDate?: string;
  isStudying?: boolean;
}

export interface Experience {
  id?: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  achievements?: string[];
  // Component compatibility fields
  jobTitle?: string;
  companyName?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrentlyWorking?: boolean;
}

export interface Certification {
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date?: string;
  credential_id?: string;
}

export interface Language {
  language: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

// Base profile interface
export interface BaseProfile {
  personal_info: PersonalInfo;
  cv_file_url?: string;
}

// Job seeker specific profile
export interface JobSeekerProfile extends BaseProfile {
  user_type: 'job';
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  desired_salary_min?: number;
  desired_salary_max?: number;
  preferred_locations: string[];
  job_preferences: {
    employment_type: string[]; // full-time, part-time, contract, internship
    remote_work: boolean;
    industry_preferences: string[];
  };
}

// Scholarship seeker specific profile
export interface ScholarshipSeekerProfile extends BaseProfile {
  user_type: 'scholarship';
  academic_background: {
    current_level: 'undergraduate' | 'graduate' | 'phd' | 'postdoc';
    field_of_study: string;
    current_institution: string;
    current_gpa: string;
    graduation_year: string;
  };
  academic_goals: string;
  education: Education[];
  achievements: string[];
  research_interests: string[];
  scholarship_preferences: {
    scholarship_types: string[]; // merit, need-based, research, etc.
    preferred_countries: string[];
    study_level: string[];
  };
}

// Grant seeker specific profile
export interface GrantSeekerProfile extends BaseProfile {
  user_type: 'grant';
  project_details: {
    project_title: string;
    project_description: string;
    project_goals: string;
    project_timeline: string;
    requested_amount: number;
  };
  organization_info: {
    organization_name: string;
    organization_type: 'nonprofit' | 'for-profit' | 'academic' | 'government' | 'individual';
    tax_id?: string;
    website?: string;
  };
  experience: Experience[];
  education: Education[];
  previous_grants: {
    grant_name: string;
    amount: number;
    year: string;
    funder: string;
  }[];
  grant_preferences: {
    grant_types: string[]; // research, startup, nonprofit, etc.
    funding_range: {
      min: number;
      max: number;
    };
  };
}

export type UserProfile = JobSeekerProfile | ScholarshipSeekerProfile | GrantSeekerProfile;

// Onboarding state interface
export interface OnboardingState {
  step: number;
  user_type: UserType | null;
  is_complete: boolean;
  current_data: Partial<UserProfile>;
}

// Mock data interfaces for local storage
export interface MockOnboardingData {
  user_type: UserType;
  step: number;
  profile_data: Partial<UserProfile>;
  is_complete: boolean;
}
