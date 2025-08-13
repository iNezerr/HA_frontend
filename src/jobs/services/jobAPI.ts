/**
 * Job Application API Service
 * Handles all job-related API calls
 */

import { apiClient } from '../../services/apiClient';

// Types for job applications
export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  experience: string;
  deadline?: string;
  applyLink: string;
  isRemote: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
  appliedAt: string;
  notes?: string;
  job: JobOpportunity;
}

export interface SavedJob {
  id: string;
  jobId: string;
  userId: string;
  savedAt: string;
  job: JobOpportunity;
}

export interface JobSearchParams {
  query?: string;
  location?: string;
  jobType?: string[];
  experience?: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote?: boolean;
  skills?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'salary';
  sortOrder?: 'asc' | 'desc';
}

export interface JobSearchResponse {
  jobs: JobOpportunity[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApplyToJobRequest {
  jobId: string;
  coverLetter?: string;
  additionalDocuments?: File[];
}

export interface UpdateApplicationRequest {
  status?: JobApplication['status'];
  notes?: string;
}

// Job Application API Service
export class JobAPI {
  private static readonly BASE_PATH = '/jobs';

  /**
   * Get personalized job recommendations
   */
  static async getRecommendations(limit: number = 10): Promise<JobOpportunity[]> {
    return apiClient.get(`${this.BASE_PATH}/recommendations?limit=${limit}`);
  }

  /**
   * Search jobs with filters
   */
  static async searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return apiClient.get(`${this.BASE_PATH}/search?${queryParams.toString()}`);
  }

  /**
   * Get job details by ID
   */
  static async getJobById(jobId: string): Promise<JobOpportunity> {
    return apiClient.get(`${this.BASE_PATH}/${jobId}`);
  }

  /**
   * Apply to a job
   */
  static async applyToJob(applicationData: ApplyToJobRequest): Promise<JobApplication> {
    const formData = new FormData();
    formData.append('jobId', applicationData.jobId);
    
    if (applicationData.coverLetter) {
      formData.append('coverLetter', applicationData.coverLetter);
    }
    
    if (applicationData.additionalDocuments) {
      applicationData.additionalDocuments.forEach((file, index) => {
        formData.append(`additionalDocuments[${index}]`, file);
      });
    }

    return apiClient.post(`${this.BASE_PATH}/apply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Get user's job applications
   */
  static async getMyApplications(
    page: number = 1,
    limit: number = 20,
    status?: JobApplication['status']
  ): Promise<{
    applications: JobApplication[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    return apiClient.get(`${this.BASE_PATH}/applications?${params.toString()}`);
  }

  /**
   * Update job application
   */
  static async updateApplication(
    applicationId: string,
    updateData: UpdateApplicationRequest
  ): Promise<JobApplication> {
    return apiClient.patch(`${this.BASE_PATH}/applications/${applicationId}`, updateData);
  }

  /**
   * Withdraw job application
   */
  static async withdrawApplication(applicationId: string): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/applications/${applicationId}`);
  }

  /**
   * Save job for later
   */
  static async saveJob(jobId: string): Promise<SavedJob> {
    return apiClient.post(`${this.BASE_PATH}/save`, { jobId });
  }

  /**
   * Remove saved job
   */
  static async unsaveJob(jobId: string): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/save/${jobId}`);
  }

  /**
   * Get saved jobs
   */
  static async getSavedJobs(page: number = 1, limit: number = 20): Promise<{
    savedJobs: SavedJob[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    return apiClient.get(`${this.BASE_PATH}/saved?page=${page}&limit=${limit}`);
  }

  /**
   * Check if job is saved
   */
  static async isJobSaved(jobId: string): Promise<{ isSaved: boolean }> {
    return apiClient.get(`${this.BASE_PATH}/saved/check/${jobId}`);
  }

  /**
   * Get job application status
   */
  static async getApplicationStatus(jobId: string): Promise<{
    hasApplied: boolean;
    application?: JobApplication;
  }> {
    return apiClient.get(`${this.BASE_PATH}/application-status/${jobId}`);
  }

  /**
   * Get similar jobs
   */
  static async getSimilarJobs(jobId: string, limit: number = 5): Promise<JobOpportunity[]> {
    return apiClient.get(`${this.BASE_PATH}/${jobId}/similar?limit=${limit}`);
  }
}

export default JobAPI;
