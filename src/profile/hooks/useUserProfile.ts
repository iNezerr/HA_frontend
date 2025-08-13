/**
 * User Profile Hook
 * Manages user profile data and operations
 */

import { useCallback } from 'react';
import { useAPI } from '../../hooks/useAPI';
import { useMutation } from '../../hooks/useMutation';
import { 
  UserAPI, 
  UserProfile, 
  UpdateProfileRequest,
  UploadResumeResponse 
} from '../services/userAPI';
import { ApiError } from '../../services/apiClient';

export interface UseUserProfileOptions {
  onUpdateSuccess?: (profile: UserProfile) => void;
  onUploadSuccess?: (upload: UploadResumeResponse) => void;
  onError?: (error: ApiError) => void;
}

export interface UseUserProfileResult {
  // Data
  profile: UserProfile | null;
  profileCompletion: { percentage: number; missingFields: string[] } | null;
  
  // Loading states
  isLoadingProfile: boolean;
  isLoadingCompletion: boolean;
  
  // Error states
  profileError: ApiError | null;
  completionError: ApiError | null;
  
  // Actions
  updateProfile: (profileData: UpdateProfileRequest) => Promise<UserProfile>;
  uploadResume: (file: File, onProgress?: (progress: number) => void) => Promise<UploadResumeResponse>;
  deleteResume: () => Promise<void>;
  uploadProposal: (file: File, onProgress?: (progress: number) => void) => Promise<UploadResumeResponse>;
  deleteProposal: () => Promise<void>;
  completeOnboarding: () => Promise<{ success: boolean }>;
  deleteAccount: () => Promise<void>;
  updatePreferences: (preferences: any) => Promise<{ success: boolean }>;
  
  // Refresh functions
  refreshProfile: () => Promise<void>;
  refreshCompletion: () => Promise<void>;
  
  // Mutation states
  updateMutation: {
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
  };
  uploadMutation: {
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
  };
  onboardingMutation: {
    isLoading: boolean;
    error: ApiError | null;
    isSuccess: boolean;
  };
}

export function useUserProfile(options: UseUserProfileOptions = {}): UseUserProfileResult {
  const { onUpdateSuccess, onUploadSuccess, onError } = options;

  // Get user profile
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refreshProfile,
  } = useAPI(
    () => UserAPI.getProfile(),
    'user-profile',
    {
      enabled: true,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 10 * 60 * 1000, // 10 minutes
      onError,
    }
  );

  // Get profile completion
  const {
    data: profileCompletion,
    isLoading: isLoadingCompletion,
    error: completionError,
    refetch: refreshCompletion,
  } = useAPI(
    () => UserAPI.getProfileCompletion(),
    'profile-completion',
    {
      enabled: true,
      refetchOnMount: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError,
    }
  );

  // Update profile mutation
  const updateMutation = useMutation(
    (profileData: UpdateProfileRequest) => UserAPI.updateProfile(profileData),
    {
      onSuccess: async (updatedProfile: UserProfile) => {
        // Refresh profile and completion data
        await Promise.all([refreshProfile(), refreshCompletion()]);
        onUpdateSuccess?.(updatedProfile);
      },
      onError,
    }
  );

  // Upload resume/file mutation
  const uploadMutation = useMutation(
    ({ file, onProgress, type }: { 
      file: File; 
      onProgress?: (progress: number) => void; 
      type: 'resume' | 'proposal' 
    }) => {
      return type === 'resume' 
        ? UserAPI.uploadResume(file, onProgress)
        : UserAPI.uploadProposal(file, onProgress);
    },
    {
      onSuccess: async (uploadResponse: UploadResumeResponse) => {
        // Refresh profile data
        await refreshProfile();
        onUploadSuccess?.(uploadResponse);
      },
      onError,
    }
  );

  // Delete resume mutation
  const deleteResumeMutation = useMutation(
    () => UserAPI.deleteResume(),
    {
      onSuccess: async () => {
        // Refresh profile data
        await refreshProfile();
      },
      onError,
    }
  );

  // Delete proposal mutation
  const deleteProposalMutation = useMutation(
    () => UserAPI.deleteProposal(),
    {
      onSuccess: async () => {
        // Refresh profile data
        await refreshProfile();
      },
      onError,
    }
  );

  // Complete onboarding mutation
  const onboardingMutation = useMutation(
    () => UserAPI.completeOnboarding(),
    {
      onSuccess: async () => {
        // Refresh profile data
        await refreshProfile();
      },
      onError,
    }
  );

  // Delete account mutation
  const deleteAccountMutation = useMutation(
    () => UserAPI.deleteAccount(),
    {
      onError,
    }
  );

  // Update preferences mutation
  const preferencesMutation = useMutation(
    (preferences: any) => UserAPI.updatePreferences(preferences),
    {
      onSuccess: async () => {
        // Refresh profile data
        await refreshProfile();
      },
      onError,
    }
  );

  // Action functions
  const updateProfile = useCallback(async (profileData: UpdateProfileRequest): Promise<UserProfile> => {
    return updateMutation.mutate(profileData);
  }, [updateMutation.mutate]);

  const uploadResume = useCallback(async (
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<UploadResumeResponse> => {
    return uploadMutation.mutate({ file, onProgress, type: 'resume' });
  }, [uploadMutation.mutate]);

  const deleteResume = useCallback(async (): Promise<void> => {
    return deleteResumeMutation.mutate(undefined);
  }, [deleteResumeMutation.mutate]);

  const uploadProposal = useCallback(async (
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<UploadResumeResponse> => {
    return uploadMutation.mutate({ file, onProgress, type: 'proposal' });
  }, [uploadMutation.mutate]);

  const deleteProposal = useCallback(async (): Promise<void> => {
    return deleteProposalMutation.mutate(undefined);
  }, [deleteProposalMutation.mutate]);

  const completeOnboarding = useCallback(async (): Promise<{ success: boolean }> => {
    return onboardingMutation.mutate(undefined);
  }, [onboardingMutation.mutate]);

  const deleteAccount = useCallback(async (): Promise<void> => {
    return deleteAccountMutation.mutate(undefined);
  }, [deleteAccountMutation.mutate]);

  const updatePreferences = useCallback(async (preferences: any): Promise<{ success: boolean }> => {
    return preferencesMutation.mutate(preferences);
  }, [preferencesMutation.mutate]);

  return {
    // Data
    profile,
    profileCompletion,
    
    // Loading states
    isLoadingProfile,
    isLoadingCompletion,
    
    // Error states
    profileError,
    completionError,
    
    // Actions
    updateProfile,
    uploadResume,
    deleteResume,
    uploadProposal,
    deleteProposal,
    completeOnboarding,
    deleteAccount,
    updatePreferences,
    
    // Refresh functions
    refreshProfile,
    refreshCompletion,
    
    // Mutation states
    updateMutation: {
      isLoading: updateMutation.isLoading,
      error: updateMutation.error,
      isSuccess: updateMutation.isSuccess,
    },
    uploadMutation: {
      isLoading: uploadMutation.isLoading,
      error: uploadMutation.error,
      isSuccess: uploadMutation.isSuccess,
    },
    onboardingMutation: {
      isLoading: onboardingMutation.isLoading,
      error: onboardingMutation.error,
      isSuccess: onboardingMutation.isSuccess,
    },
  };
}

export default useUserProfile;
