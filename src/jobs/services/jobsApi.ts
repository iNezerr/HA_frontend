import { apiClient } from '../../services/apiClient';
import { Job, JobFilters, JobsResponse, JobInteraction } from '../types';

// Use apiClient directly (it's already the singleton instance)
const client = apiClient;

const JOBS_API_BASE = '/opportunities/jobs';
const APPLICATIONS_API_BASE = '/applications';

/**
 * Get jobs based on filters
 */
export const getJobs = async (filters: JobFilters = {}): Promise<JobsResponse> => {
  const params = new URLSearchParams();

  // Add filter parameters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v.toString()));
      } else {
        params.append(key, value.toString());
      }
    }
  });

  const queryString = params.toString();
  const endpoint = `${JOBS_API_BASE}/${queryString ? `?${queryString}` : ''}`;

  return client.get(endpoint);
};

/**
 * Get dashboard feed with AI-matched job opportunities
 */
export const getDashboardJobs = async (filters: JobFilters = {}): Promise<JobsResponse> => {
  const params = new URLSearchParams();

  // Add filter parameters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const endpoint = `${APPLICATIONS_API_BASE}/dashboard/${queryString ? `?${queryString}` : ''}`;

  return client.get(endpoint);
};

/**
 * Get a specific job by ID
 */
export const getJob = async (jobId: string): Promise<Job> => {
  return client.get(`${JOBS_API_BASE}/${jobId}/`);
};

/**
 * Save a job
 */
export const toggleSaveJob = async (jobId: string): Promise<JobInteraction> => {
  return client.post(`${APPLICATIONS_API_BASE}/opportunities/${jobId}/save/`);
};

/**
 * Unsave a job
 */
export const unsaveJob = async (jobId: string): Promise<JobInteraction> => {
  return client.post(`${APPLICATIONS_API_BASE}/opportunities/${jobId}/unsave/`);
};

/**
 * Apply to a job
 */
export const applyToJob = async (jobId: string, applicationData?: any): Promise<{ success: boolean; application_id: string }> => {
  return client.post(`${APPLICATIONS_API_BASE}/opportunities/${jobId}/apply/`, applicationData);
};

/**
 * Get saved jobs
 */
export const getSavedJobs = async (filters: JobFilters = {}): Promise<JobsResponse> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const endpoint = `${APPLICATIONS_API_BASE}/saved/${queryString ? `?${queryString}` : ''}`;

  return client.get(endpoint);
};

/**
 * Get applied jobs
 */
export const getAppliedJobs = async (): Promise<{
  total_applications: number;
  applications: Array<{
    id: string;
    job: Job;
    status: string;
    applied_at: string;
    last_updated: string;
  }>;
}> => {
  return client.get(`${APPLICATIONS_API_BASE}/applications/`);
};
