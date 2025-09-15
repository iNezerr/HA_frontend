/**
 * User Profile API Service
 * Handles all user profile-related API calls
 */

import { apiClient } from '../../services/apiClient';

// Career Profile Data interface
export interface CareerProfileData {
  current_role: string;
  career_level: string;
  industry: string;
  skills: string[];
  preferred_roles: string[];
  jobTitle?: string;
}

// Types for user profile
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  userType: 'job' | 'scholarship' | 'grant';
  isOnboarded: boolean;
  profileData: JobSeekerProfile | ScholarshipSeekerProfile | GrantSeekerProfile;
  createdAt: string;
  updatedAt: string;
}

export interface JobSeekerProfile {
  resume?: {
    filename: string;
    url: string;
    uploadedAt: string;
  };
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }[];
  location?: string;
  preferredJobTypes: string[];
  salaryExpectation?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface ScholarshipSeekerProfile {
  academicBackground: {
    currentLevel: string;
    institution: string;
    major: string;
    gpa: string;
    expectedGraduation: string;
  };
  achievements: string[];
  goals: string;
  financialNeed?: string;
  extracurriculars: string[];
  resume?: {
    filename: string;
    url: string;
    uploadedAt: string;
  };
}

export interface GrantSeekerProfile {
  organization?: string;
  projectTitle: string;
  projectDescription: string;
  fundingAmount: {
    requested: number;
    currency: string;
  };
  projectDuration: string;
  projectCategory: string;
  teamMembers?: {
    name: string;
    role: string;
    experience: string;
  }[];
  proposal?: {
    filename: string;
    url: string;
    uploadedAt: string;
  };
}

export interface UpdateProfileRequest {
  displayName?: string;
  profileData: Partial<JobSeekerProfile | ScholarshipSeekerProfile | GrantSeekerProfile>;
}

export interface UploadResumeResponse {
  filename: string;
  url: string;
  uploadedAt: string;
}

// User Profile API Service
export class UserAPI {
  private static readonly BASE_PATH = '/profile';

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<UserProfile> {
    return apiClient.get(`${this.BASE_PATH}`);
  }

  /**
   * Update user profile
   */
  static async updateProfile(profileData: UpdateProfileRequest): Promise<UserProfile> {
    return apiClient.patch(`${this.BASE_PATH}`, profileData);
  }

  /**
   * Upload resume/CV file
   */
  static async uploadResume(
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<UploadResumeResponse> {
    return apiClient.uploadFile(`${this.BASE_PATH}/upload-resume`, file, onUploadProgress);
  }

  /**
   * Delete resume/CV file
   */
  static async deleteResume(): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/resume`);
  }

  /**
   * Upload proposal file (for grant seekers)
   */
  static async uploadProposal(
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<UploadResumeResponse> {
    return apiClient.uploadFile(`${this.BASE_PATH}/upload-proposal`, file, onUploadProgress);
  }

  /**
   * Delete proposal file
   */
  static async deleteProposal(): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/proposal`);
  }

  /**
   * Upload document file (general document upload)
   */
  static async uploadDocument(
    file: File,
    documentType: 'cv' | 'resume' | 'proposal' | 'certificate' | 'transcript' | 'other' = 'cv',
    onUploadProgress?: (progress: number) => void
  ): Promise<UploadResumeResponse> {
    return apiClient.uploadFileWithData(
      `${this.BASE_PATH}/upload-document-file`, 
      file, 
      { document_type: documentType },
      onUploadProgress
    );
  }

  /**
   * Update onboarding status
   */
  static async completeOnboarding(): Promise<{ success: boolean }> {
    return apiClient.post(`${this.BASE_PATH}/complete-onboarding`);
  }

  /**
   * Delete user account
   */
  static async deleteAccount(): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/account`);
  }

  /**
   * Get profile completion percentage
   */
  static async getProfileCompletion(): Promise<{ percentage: number; missingFields: string[] }> {
    return apiClient.get(`${this.BASE_PATH}/completion`);
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(preferences: {
    emailNotifications?: boolean;
    marketingEmails?: boolean;
    language?: string;
    timezone?: string;
  }): Promise<{ success: boolean }> {
    return apiClient.patch(`${this.BASE_PATH}/preferences`, preferences);
  }
}

export default UserAPI;

// Export instance for convenience
export const userAPI = UserAPI;
