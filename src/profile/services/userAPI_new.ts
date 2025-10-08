/**
 * User Profile API Service
 * Handles all user profile-related API calls following the new centralized pattern
 */

import { apiClient } from '../../services/apiClient';

// Types for user profile based on backend models
export interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  name: string;
  user_type: 'job' | 'scholarship' | 'grant';
  onboarded: boolean;
  profile_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  profile?: ProfileData;
}

export interface ProfileData {
  summary: string;
  skills: string[];
  education: any[];
  experience_years: number;
  gpa: number | null;
  location: string;
  last_parsed_at: string | null;
}

// Add these interfaces after ProfileData interface (around line 28)

export interface CareerProfileData {
  current_role: string;
  career_level: string;
  industry: string;
  skills: string[];
  preferred_roles: string[];
  jobTitle?: string;
  profileSummary?: string;
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

export interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  content_type: string;
  document_type: 'cv' | 'cover_letter' | 'transcript' | 'proposal' | 'other';
  gcs_url: string;
  uploaded_at: string;
}

export interface ProfileCompletion {
  percentage: number;
  missingFields: string[];
  completedSections: string[];
  totalSections: number;
  completedCount: number;
}

// User Profile API Service
export class UserAPI {
  private static readonly BASE_PATH = '/users';

  /**
   * Get current user data
   */
  static async getCurrentUser(): Promise<UserProfile> {
    return apiClient.get(`${this.BASE_PATH}/me/`);
  }

  /**
   * Update user basic information
   */
  static async updateUser(userData: Partial<UserProfile>): Promise<UserProfile> {
    return apiClient.patch(`${this.BASE_PATH}/me/update/`, userData);
  }

  /**
   * Update user profile data
   */
  static async updateProfile(profileData: Partial<ProfileData>): Promise<UserProfile> {
    return apiClient.patch(`${this.BASE_PATH}/profile/update/`, profileData);
  }

  /**
   * Get user documents
   */
  static async getDocuments(): Promise<Document[]> {
    return apiClient.get(`${this.BASE_PATH}/documents/`);
  }

  /**
   * Upload document file
   */
  static async uploadDocument(
    file: File,
    documentType: 'cv' | 'cover_letter' | 'transcript' | 'proposal' | 'other' = 'cv',
    onUploadProgress?: (progress: number) => void
  ): Promise<Document> {
    return apiClient.uploadFileWithData(
      `${this.BASE_PATH}/profile/upload-document-file/`, 
      file, 
      { document_type: documentType },
      onUploadProgress
    );
  }

  /**
   * Get profile completion data
   */
  static async getProfileCompletion(): Promise<ProfileCompletion> {
    return apiClient.get(`${this.BASE_PATH}/profile/completion/`);
  }

  /**
   * Upload resume/CV file (legacy support)
   */
  static async uploadResume(
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<Document> {
    return this.uploadDocument(file, 'cv', onUploadProgress);
  }

  /**
   * Delete resume/CV file
   */
  static async deleteResume(): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/documents/cv/`);
  }

  /**
   * Upload proposal file (for grant seekers)
   */
  static async uploadProposal(
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<Document> {
    return this.uploadDocument(file, 'proposal', onUploadProgress);
  }

  /**
   * Delete proposal file
   */
  static async deleteProposal(): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/documents/proposal/`);
  }

  /**
   * Update onboarding status
   */
  static async completeOnboarding(): Promise<{ success: boolean }> {
    return apiClient.post(`${this.BASE_PATH}/complete-onboarding/`);
  }

  /**
   * Delete user account
   */
  static async deleteAccount(): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/account/`);
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
    return apiClient.patch(`${this.BASE_PATH}/preferences/`, preferences);
  }
}

// Export class as singleton instance
export const userAPI = UserAPI;

export default UserAPI;
