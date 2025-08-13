/**
 * Scholarship Application API Service
 * Handles all scholarship-related API calls
 */

import { apiClient } from '../../services/apiClient';

// Types for scholarship applications
export interface ScholarshipOpportunity {
  id: string;
  title: string;
  provider: string;
  description: string;
  eligibility: string[];
  amount: {
    value: number;
    currency: string;
    type: 'full' | 'partial' | 'variable';
  };
  applicationDeadline: string;
  studyLevel: string[];
  fieldOfStudy: string[];
  location: string[];
  requirements: string[];
  benefits: string[];
  applicationUrl: string;
  isRenewable: boolean;
  gpaRequirement?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScholarshipApplication {
  id: string;
  scholarshipId: string;
  userId: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'awarded' | 'rejected';
  appliedAt: string;
  submissionData: {
    essay?: string;
    personalStatement?: string;
    additionalDocuments?: {
      filename: string;
      url: string;
      type: string;
    }[];
  };
  scholarship: ScholarshipOpportunity;
}

export interface SavedScholarship {
  id: string;
  scholarshipId: string;
  userId: string;
  savedAt: string;
  scholarship: ScholarshipOpportunity;
}

export interface ScholarshipSearchParams {
  query?: string;
  studyLevel?: string[];
  fieldOfStudy?: string[];
  location?: string[];
  amountMin?: number;
  amountMax?: number;
  deadline?: 'week' | 'month' | 'quarter' | 'year';
  gpaMin?: number;
  isRenewable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'deadline' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface ScholarshipSearchResponse {
  scholarships: ScholarshipOpportunity[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApplyToScholarshipRequest {
  scholarshipId: string;
  essay?: string;
  personalStatement?: string;
  additionalDocuments?: File[];
}

export interface UpdateScholarshipApplicationRequest {
  status?: ScholarshipApplication['status'];
  submissionData?: {
    essay?: string;
    personalStatement?: string;
  };
}

// Scholarship Application API Service
export class ScholarshipAPI {
  private static readonly BASE_PATH = '/scholarships';

  /**
   * Get personalized scholarship recommendations
   */
  static async getRecommendations(limit: number = 10): Promise<ScholarshipOpportunity[]> {
    return apiClient.get(`${this.BASE_PATH}/recommendations?limit=${limit}`);
  }

  /**
   * Search scholarships with filters
   */
  static async searchScholarships(params: ScholarshipSearchParams): Promise<ScholarshipSearchResponse> {
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
   * Get scholarship details by ID
   */
  static async getScholarshipById(scholarshipId: string): Promise<ScholarshipOpportunity> {
    return apiClient.get(`${this.BASE_PATH}/${scholarshipId}`);
  }

  /**
   * Apply to a scholarship
   */
  static async applyToScholarship(applicationData: ApplyToScholarshipRequest): Promise<ScholarshipApplication> {
    const formData = new FormData();
    formData.append('scholarshipId', applicationData.scholarshipId);
    
    if (applicationData.essay) {
      formData.append('essay', applicationData.essay);
    }
    
    if (applicationData.personalStatement) {
      formData.append('personalStatement', applicationData.personalStatement);
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
   * Get user's scholarship applications
   */
  static async getMyApplications(
    page: number = 1,
    limit: number = 20,
    status?: ScholarshipApplication['status']
  ): Promise<{
    applications: ScholarshipApplication[];
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
   * Update scholarship application
   */
  static async updateApplication(
    applicationId: string,
    updateData: UpdateScholarshipApplicationRequest
  ): Promise<ScholarshipApplication> {
    return apiClient.patch(`${this.BASE_PATH}/applications/${applicationId}`, updateData);
  }

  /**
   * Withdraw scholarship application
   */
  static async withdrawApplication(applicationId: string): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/applications/${applicationId}`);
  }

  /**
   * Save scholarship for later
   */
  static async saveScholarship(scholarshipId: string): Promise<SavedScholarship> {
    return apiClient.post(`${this.BASE_PATH}/save`, { scholarshipId });
  }

  /**
   * Remove saved scholarship
   */
  static async unsaveScholarship(scholarshipId: string): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/save/${scholarshipId}`);
  }

  /**
   * Get saved scholarships
   */
  static async getSavedScholarships(page: number = 1, limit: number = 20): Promise<{
    savedScholarships: SavedScholarship[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    return apiClient.get(`${this.BASE_PATH}/saved?page=${page}&limit=${limit}`);
  }

  /**
   * Check if scholarship is saved
   */
  static async isScholarshipSaved(scholarshipId: string): Promise<{ isSaved: boolean }> {
    return apiClient.get(`${this.BASE_PATH}/saved/check/${scholarshipId}`);
  }

  /**
   * Get scholarship application status
   */
  static async getApplicationStatus(scholarshipId: string): Promise<{
    hasApplied: boolean;
    application?: ScholarshipApplication;
  }> {
    return apiClient.get(`${this.BASE_PATH}/application-status/${scholarshipId}`);
  }

  /**
   * Get similar scholarships
   */
  static async getSimilarScholarships(scholarshipId: string, limit: number = 5): Promise<ScholarshipOpportunity[]> {
    return apiClient.get(`${this.BASE_PATH}/${scholarshipId}/similar?limit=${limit}`);
  }

  /**
   * Get scholarship eligibility check
   */
  static async checkEligibility(scholarshipId: string): Promise<{
    isEligible: boolean;
    missingRequirements: string[];
    eligibilityScore: number;
  }> {
    return apiClient.get(`${this.BASE_PATH}/${scholarshipId}/eligibility`);
  }

  /**
   * Get scholarship deadlines (upcoming)
   */
  static async getUpcomingDeadlines(days: number = 30): Promise<{
    scholarships: ScholarshipOpportunity[];
    count: number;
  }> {
    return apiClient.get(`${this.BASE_PATH}/deadlines?days=${days}`);
  }
}

export default ScholarshipAPI;
