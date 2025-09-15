// Placeholder API functions to fix compilation errors
// These should be replaced with actual implementations

// Import specific types to avoid name collisions with locally-declared types in components
import type { Opportunity as CoreOpportunity, OpportunityFilters } from '../types/opportunities';

// Job-related API functions
export const getJobs = async (
  _filters: OpportunityFilters
): Promise<{ results: any[]; count: number; next?: string; previous?: string } | any[]> => {
  // UI stub
  return { results: [], count: 0, next: undefined, previous: undefined };
};

export const getJob = async (id: number | string): Promise<any> => {
  // UI stub
  return {
    id: id,
    title: '',
    company: '',
    location: '',
    job_type: '',
    experience_level: '',
    skills: '',
    description: '',
    requirements: '',
    salary_range: '',
    application_url: '',
    is_active: true,
  };
};

export const createJob = async (data: any): Promise<any> => {
  console.log('createJob called with data:', data);
  return { success: true };
};

export const updateJob = async (id: number, data: any): Promise<any> => {
  console.log('updateJob called with id:', id, 'data:', data);
  return { success: true };
};

// Scholarship-related API functions
export const getScholarships = async (
  _filters: any
): Promise<{ results: any[]; count?: number; next?: string; previous?: string }> => {
  // UI stub
  return { results: [], count: 0 };
};

export const getScholarship = async (id: string): Promise<any> => {
  console.log('getScholarship called with id:', id);
  return {};
};

export const createScholarship = async (data: any): Promise<any> => {
  console.log('createScholarship called with data:', data);
  return { success: true };
};

export const updateScholarship = async (id: number, data: any): Promise<any> => {
  console.log('updateScholarship called with id:', id, 'data:', data);
  return { success: true };
};

export const applyToScholarship = async (id: number): Promise<any> => {
  console.log('applyToScholarship called with id:', id);
  return { success: true };
};

// Opportunity-related API functions
export const getOpportunities = async (
  _filters: OpportunityFilters
): Promise<{ results: CoreOpportunity[] }> => {
  // UI stub
  return { results: [] };
};

export const getAIMatches = async (_filters: any): Promise<{ results: CoreOpportunity[] }> => {
  // UI stub
  return { results: [] };
};

// Document/File upload functions
export const uploadDocument = async (_file: File): Promise<{ url: string }> => {
  // UI stub
  return { url: 'https://example.com/placeholder-url' };
};

// Profile-related API functions
export const getProfileCompletionStatus = async (): Promise<{
  completion_percentage: number;
  missing_sections: string[];
  completed_sections: string[];
}> => {
  // UI stub
  return { completion_percentage: 0, missing_sections: [], completed_sections: [] };
};

// Auth-related functions
export const registerUser = async (data: any): Promise<any> => {
  console.log('registerUser called with data:', data);
  return { success: true };
};

// Admin helper to check if user is admin
export const isAdmin = (role?: string): boolean => {
  return role === 'admin' || role === 'superuser';
};

// Validation error types
export interface ValidationErrors {
  personal?: string[];
  career?: string[];
  [key: string]: string[] | undefined;
}
