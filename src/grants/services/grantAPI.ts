/**
 * Grant Application API Service
 * Handles all grant-related API calls
 */

import { apiClient } from '../../services/apiClient';

// Types for grant applications
export interface GrantOpportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  fundingAmount: {
    min: number;
    max: number;
    currency: string;
  };
  eligibility: string[];
  applicationDeadline: string;
  projectDuration: string;
  categories: string[];
  location: string[];
  requirements: string[];
  objectives: string[];
  applicationUrl: string;
  matchingFundsRequired: boolean;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GrantApplication {
  id: string;
  grantId: string;
  userId: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'withdrawn';
  appliedAt: string;
  submissionData: {
    projectTitle: string;
    projectDescription: string;
    fundingAmount: number;
    projectDuration: string;
    budget: {
      category: string;
      amount: number;
      description: string;
    }[];
    teamMembers?: {
      name: string;
      role: string;
      qualifications: string;
    }[];
    timeline: {
      milestone: string;
      duration: string;
      deliverables: string[];
    }[];
    proposal?: {
      filename: string;
      url: string;
      uploadedAt: string;
    };
    additionalDocuments?: {
      filename: string;
      url: string;
      type: string;
      uploadedAt: string;
    }[];
  };
  grant: GrantOpportunity;
}

export interface SavedGrant {
  id: string;
  grantId: string;
  userId: string;
  savedAt: string;
  grant: GrantOpportunity;
}

export interface GrantSearchParams {
  query?: string;
  categories?: string[];
  location?: string[];
  fundingMin?: number;
  fundingMax?: number;
  deadline?: 'week' | 'month' | 'quarter' | 'year';
  projectDuration?: string;
  matchingFundsRequired?: boolean;
  isRecurring?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'deadline' | 'funding';
  sortOrder?: 'asc' | 'desc';
}

export interface GrantSearchResponse {
  grants: GrantOpportunity[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApplyToGrantRequest {
  grantId: string;
  projectTitle: string;
  projectDescription: string;
  fundingAmount: number;
  projectDuration: string;
  budget: {
    category: string;
    amount: number;
    description: string;
  }[];
  teamMembers?: {
    name: string;
    role: string;
    qualifications: string;
  }[];
  timeline: {
    milestone: string;
    duration: string;
    deliverables: string[];
  }[];
  proposal?: File;
  additionalDocuments?: File[];
}

export interface UpdateGrantApplicationRequest {
  status?: GrantApplication['status'];
  submissionData?: Partial<GrantApplication['submissionData']>;
}

// Grant Application API Service
export class GrantAPI {
  private static readonly BASE_PATH = '/grants';

  /**
   * Get personalized grant recommendations
   */
  static async getRecommendations(limit: number = 10): Promise<GrantOpportunity[]> {
    return apiClient.get(`${this.BASE_PATH}/recommendations?limit=${limit}`);
  }

  /**
   * Search grants with filters
   */
  static async searchGrants(params: GrantSearchParams): Promise<GrantSearchResponse> {
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
   * Get grant details by ID
   */
  static async getGrantById(grantId: string): Promise<GrantOpportunity> {
    return apiClient.get(`${this.BASE_PATH}/${grantId}`);
  }

  /**
   * Apply to a grant
   */
  static async applyToGrant(applicationData: ApplyToGrantRequest): Promise<GrantApplication> {
    const formData = new FormData();
    
    // Add basic data
    formData.append('grantId', applicationData.grantId);
    formData.append('projectTitle', applicationData.projectTitle);
    formData.append('projectDescription', applicationData.projectDescription);
    formData.append('fundingAmount', applicationData.fundingAmount.toString());
    formData.append('projectDuration', applicationData.projectDuration);
    
    // Add complex data as JSON strings
    formData.append('budget', JSON.stringify(applicationData.budget));
    formData.append('timeline', JSON.stringify(applicationData.timeline));
    
    if (applicationData.teamMembers) {
      formData.append('teamMembers', JSON.stringify(applicationData.teamMembers));
    }
    
    // Add files
    if (applicationData.proposal) {
      formData.append('proposal', applicationData.proposal);
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
   * Save grant application as draft
   */
  static async saveDraft(applicationData: Partial<ApplyToGrantRequest>): Promise<GrantApplication> {
    return apiClient.post(`${this.BASE_PATH}/draft`, applicationData);
  }

  /**
   * Get user's grant applications
   */
  static async getMyApplications(
    page: number = 1,
    limit: number = 20,
    status?: GrantApplication['status']
  ): Promise<{
    applications: GrantApplication[];
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
   * Update grant application
   */
  static async updateApplication(
    applicationId: string,
    updateData: UpdateGrantApplicationRequest
  ): Promise<GrantApplication> {
    return apiClient.patch(`${this.BASE_PATH}/applications/${applicationId}`, updateData);
  }

  /**
   * Submit draft application
   */
  static async submitDraft(applicationId: string): Promise<GrantApplication> {
    return apiClient.post(`${this.BASE_PATH}/applications/${applicationId}/submit`);
  }

  /**
   * Withdraw grant application
   */
  static async withdrawApplication(applicationId: string): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/applications/${applicationId}`);
  }

  /**
   * Save grant for later
   */
  static async saveGrant(grantId: string): Promise<SavedGrant> {
    return apiClient.post(`${this.BASE_PATH}/save`, { grantId });
  }

  /**
   * Remove saved grant
   */
  static async unsaveGrant(grantId: string): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/save/${grantId}`);
  }

  /**
   * Get saved grants
   */
  static async getSavedGrants(page: number = 1, limit: number = 20): Promise<{
    savedGrants: SavedGrant[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    return apiClient.get(`${this.BASE_PATH}/saved?page=${page}&limit=${limit}`);
  }

  /**
   * Check if grant is saved
   */
  static async isGrantSaved(grantId: string): Promise<{ isSaved: boolean }> {
    return apiClient.get(`${this.BASE_PATH}/saved/check/${grantId}`);
  }

  /**
   * Get grant application status
   */
  static async getApplicationStatus(grantId: string): Promise<{
    hasApplied: boolean;
    application?: GrantApplication;
  }> {
    return apiClient.get(`${this.BASE_PATH}/application-status/${grantId}`);
  }

  /**
   * Get similar grants
   */
  static async getSimilarGrants(grantId: string, limit: number = 5): Promise<GrantOpportunity[]> {
    return apiClient.get(`${this.BASE_PATH}/${grantId}/similar?limit=${limit}`);
  }

  /**
   * Get grant eligibility check
   */
  static async checkEligibility(grantId: string): Promise<{
    isEligible: boolean;
    missingRequirements: string[];
    eligibilityScore: number;
  }> {
    return apiClient.get(`${this.BASE_PATH}/${grantId}/eligibility`);
  }

  /**
   * Get grant deadlines (upcoming)
   */
  static async getUpcomingDeadlines(days: number = 30): Promise<{
    grants: GrantOpportunity[];
    count: number;
  }> {
    return apiClient.get(`${this.BASE_PATH}/deadlines?days=${days}`);
  }

  /**
   * Get grant statistics
   */
  static async getGrantStats(): Promise<{
    totalGrants: number;
    totalFunding: number;
    averageFunding: number;
    topCategories: { category: string; count: number }[];
  }> {
    return apiClient.get(`${this.BASE_PATH}/stats`);
  }
}

export default GrantAPI;
