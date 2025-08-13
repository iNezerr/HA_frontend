/**
 * Main API Services Export
 * Central export point for all API services
 */

// Base API Client
export { default as apiClient } from './apiClient';
export type { ApiResponse, ApiError } from './apiClient';

// Authentication
export { default as AuthAPI } from '../auth/services/authAPI';
export type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  PasswordResetRequest,
  TokenRefreshRequest,
  VerifyTokenRequest 
} from '../auth/services/authAPI';

// User Profile
export { default as UserAPI } from '../profile/services/userAPI';
export type { 
  UserProfile,
  JobSeekerProfile,
  ScholarshipSeekerProfile,
  GrantSeekerProfile,
  UpdateProfileRequest,
  UploadResumeResponse 
} from '../profile/services/userAPI';

// Jobs
export { default as JobAPI } from '../jobs/services/jobAPI';
export type { 
  JobOpportunity,
  JobApplication,
  SavedJob,
  JobSearchParams,
  JobSearchResponse,
  ApplyToJobRequest,
  UpdateApplicationRequest 
} from '../jobs/services/jobAPI';

// Scholarships
export { default as ScholarshipAPI } from '../scholarships/services/scholarshipAPI';
export type { 
  ScholarshipOpportunity,
  ScholarshipApplication,
  SavedScholarship,
  ScholarshipSearchParams,
  ScholarshipSearchResponse,
  ApplyToScholarshipRequest,
  UpdateScholarshipApplicationRequest 
} from '../scholarships/services/scholarshipAPI';

// Grants
export { default as GrantAPI } from '../grants/services/grantAPI';
export type { 
  GrantOpportunity,
  GrantApplication,
  SavedGrant,
  GrantSearchParams,
  GrantSearchResponse,
  ApplyToGrantRequest,
  UpdateGrantApplicationRequest 
} from '../grants/services/grantAPI';

// Companies
export { default as CompanyAPI } from '../companies/services/companyAPI';
export type { 
  Company,
  CompanySearchParams,
  CompanySearchResponse,
  CompanyReview,
  CreateReviewRequest 
} from '../companies/services/companyAPI';

// Onboarding
export { default as OnboardingAPI } from './onboardingAPI';
export type { 
  OnboardingStep,
  OnboardingFlow,
  OnboardingSubmission,
  OnboardingCompletion 
} from './onboardingAPI';

// Hooks
export { default as useAPI } from '../hooks/useAPI';
export type { UseAPIOptions, UseAPIResult } from '../hooks/useAPI';

export { default as useMutation } from '../hooks/useMutation';
export type { UseMutationOptions, UseMutationResult } from '../hooks/useMutation';

// Feature-specific hooks
export { default as useAuth } from '../auth/hooks/useAuth';
export type { UseAuthOptions, UseAuthResult } from '../auth/hooks/useAuth';

export { default as useJobApplications } from '../jobs/hooks/useJobApplications';
export type { UseJobApplicationsOptions, UseJobApplicationsResult } from '../jobs/hooks/useJobApplications';

export { default as useUserProfile } from '../profile/hooks/useUserProfile';
export type { UseUserProfileOptions, UseUserProfileResult } from '../profile/hooks/useUserProfile';

export { default as useCompanies } from '../companies/hooks/useCompanies';
export type { UseCompaniesOptions, UseCompaniesResult } from '../companies/hooks/useCompanies';
